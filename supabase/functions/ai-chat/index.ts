import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the user's API key from their settings
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's API key from settings
    const { data: settings } = await supabase
      .from("company_settings")
      .select("setting_value")
      .eq("user_id", user.id)
      .eq("setting_key", `${provider || "groq"}_api_key`)
      .maybeSingle();

    const apiKey = settings?.setting_value;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: `No se encontró API key para ${provider || "groq"}. Configure su clave en Configuración > Integraciones IA.`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine endpoint and model based on provider
    const selectedProvider = provider || "groq";
    let endpoint: string;
    let selectedModel: string;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    switch (selectedProvider) {
      case "groq":
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        selectedModel = model || "llama-3.3-70b-versatile";
        break;
      case "openai":
        endpoint = "https://api.openai.com/v1/chat/completions";
        selectedModel = model || "gpt-4o-mini";
        break;
      case "anthropic":
        endpoint = "https://api.anthropic.com/v1/messages";
        selectedModel = model || "claude-3-5-sonnet-20241022";
        headers["anthropic-version"] = "2023-06-01";
        headers["x-api-key"] = apiKey;
        delete headers["Authorization"];
        break;
      default:
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        selectedModel = model || "llama-3.3-70b-versatile";
    }

    const systemPrompt = `Eres un asistente experto en Seguridad y Salud en el Trabajo (SST) para empresas chilenas.
Tu conocimiento abarca:
- Ley 16.744 sobre accidentes del trabajo y enfermedades profesionales
- Decreto Supremo 44 sobre sistema de gestión de SST
- Convenio 155 de la OIT sobre seguridad y salud de los trabajadores
- ISO 45001 Sistema de Gestión de Seguridad y Salud en el Trabajo
- ISO 14001 Sistema de Gestión Ambiental
- ISO 9001 Sistema de Gestión de Calidad
- RIOHS, EPP, DAS, IPER, comités paritarios, inspecciones

Responde siempre en español chileno, de forma técnica pero clara.
Cuando sea relevante, cita el artículo o norma específica.
Si te piden KPIs, calcula tasas de frecuencia (TF), tasa de gravedad (TGR) según SUSESO.
Mantén respuestas concisas y accionables.`;

    let body: unknown;
    if (selectedProvider === "anthropic") {
      body = {
        model: selectedModel,
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content,
        })),
      };
    } else {
      body = {
        model: selectedModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false,
      };
    }

    const aiResponse = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de tasa excedido. Intente de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: "API key inválida. Verifique su clave en Configuración." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Error del proveedor de IA: ${aiResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();

    let assistantMessage: string;
    if (selectedProvider === "anthropic") {
      assistantMessage = aiData.content?.[0]?.text || "Sin respuesta";
    } else {
      assistantMessage = aiData.choices?.[0]?.message?.content || "Sin respuesta";
    }

    return new Response(
      JSON.stringify({ message: assistantMessage, model: selectedModel, provider: selectedProvider }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
