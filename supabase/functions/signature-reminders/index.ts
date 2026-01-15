import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Configuration: Days thresholds for reminders
const REMINDER_THRESHOLDS = [7, 3, 1]; // Days since signature requested

interface PendingSignature {
  id: string;
  document_id: string;
  employee_id: string;
  requested_at: string;
  reminder_sent_at: string | null;
  document: {
    title: string;
    document_type: string;
  };
  employee: {
    name: string;
    area: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting signature reminders scan...");

    // Fetch all pending signatures with document and employee info
    const { data: pendingSignatures, error: fetchError } = await supabase
      .from("pending_signatures")
      .select(`
        id,
        document_id,
        employee_id,
        requested_at,
        reminder_sent_at,
        document:documents(title, document_type),
        employee:employees(name, area)
      `)
      .eq("status", "pending");

    if (fetchError) {
      console.error("Error fetching pending signatures:", fetchError);
      throw fetchError;
    }

    if (!pendingSignatures || pendingSignatures.length === 0) {
      console.log("No pending signatures found");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending signatures found",
          alertsCreated: 0,
          remindersUpdated: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${pendingSignatures.length} pending signatures`);

    const now = new Date();
    let alertsCreated = 0;
    let remindersUpdated = 0;

    for (const sig of pendingSignatures as unknown as PendingSignature[]) {
      const requestedAt = new Date(sig.requested_at);
      const daysPending = Math.floor(
        (now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if we should send a reminder based on thresholds
      const lastReminder = sig.reminder_sent_at
        ? new Date(sig.reminder_sent_at)
        : null;
      const daysSinceLastReminder = lastReminder
        ? Math.floor(
            (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

      // Determine if reminder should be sent
      let shouldRemind = false;
      let reminderLevel: "info" | "warning" | "critical" = "info";

      // Logic: Send reminders at specific thresholds (7, 3, 1 days)
      // Also escalate if pending for too long
      if (daysPending >= 7) {
        reminderLevel = "critical";
        // Send critical reminder if no reminder in last 2 days
        if (daysSinceLastReminder === null || daysSinceLastReminder >= 2) {
          shouldRemind = true;
        }
      } else if (daysPending >= 3) {
        reminderLevel = "warning";
        // Send warning reminder if no reminder in last 3 days
        if (daysSinceLastReminder === null || daysSinceLastReminder >= 3) {
          shouldRemind = true;
        }
      } else if (daysPending >= 1 && daysSinceLastReminder === null) {
        // First reminder after 1 day
        reminderLevel = "info";
        shouldRemind = true;
      }

      if (shouldRemind && sig.document && sig.employee) {
        console.log(
          `Creating reminder for signature ${sig.id} (${daysPending} days pending)`
        );

        // Create alert
        const alertTitle =
          reminderLevel === "critical"
            ? `[URGENTE] Firma pendiente hace ${daysPending} días`
            : reminderLevel === "warning"
            ? `Recordatorio: Firma pendiente hace ${daysPending} días`
            : `Firma de documento pendiente`;

        const documentType = getDocumentTypeLabel(sig.document.document_type);
        const alertMessage = `El empleado ${sig.employee.name} tiene pendiente firmar el documento "${sig.document.title}" (${documentType}). Solicitado hace ${daysPending} días.`;

        const { error: alertError } = await supabase.from("alerts").insert({
          title: alertTitle,
          message: alertMessage,
          severity: reminderLevel === "critical" ? "error" : reminderLevel,
          entity_type: "document",
          entity_id: sig.document_id,
          target_areas: [sig.employee.area, "rrhh", "prevencion"],
          expires_at: new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        if (alertError) {
          console.error(`Error creating alert for ${sig.id}:`, alertError);
        } else {
          alertsCreated++;
        }

        // Update reminder_sent_at
        const { error: updateError } = await supabase
          .from("pending_signatures")
          .update({ reminder_sent_at: now.toISOString() })
          .eq("id", sig.id);

        if (updateError) {
          console.error(
            `Error updating reminder_sent_at for ${sig.id}:`,
            updateError
          );
        } else {
          remindersUpdated++;
        }
      }
    }

    console.log(
      `Scan complete. Alerts created: ${alertsCreated}, Reminders updated: ${remindersUpdated}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        pendingSignaturesChecked: pendingSignatures.length,
        alertsCreated,
        remindersUpdated,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in signature-reminders function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getDocumentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    riohs: "RIOHS",
    procedimiento: "Procedimiento",
    acta: "Acta",
    informe: "Informe",
    capacitacion: "Capacitación",
    otro: "Otro",
  };
  return labels[type] || type;
}
