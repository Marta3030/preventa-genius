export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      document_acknowledgements: {
        Row: {
          acknowledged_at: string
          document_id: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          document_id: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          document_id?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_acknowledgements_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date: string | null
          file_url: string
          id: string
          is_active: boolean
          registered_with_dt: boolean | null
          title: string
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          registered_with_dt?: boolean | null
          title: string
          updated_at?: string
          uploaded_by: string
          version?: number
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          registered_with_dt?: boolean | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: []
      }
      employee_trainings: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          created_at: string
          expiry_date: string | null
          id: string
          status: string
          training_id: string
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          status?: string
          training_id: string
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          status?: string
          training_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_trainings_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          area: Database["public"]["Enums"]["area_type"]
          assigned_to: string | null
          closed_at: string | null
          corrective_actions: string | null
          created_at: string
          days_lost: number | null
          description: string
          id: string
          incident_date: string
          investigation_notes: string | null
          investigation_status: string | null
          reported_by: string
          severity: Database["public"]["Enums"]["incident_severity"]
          title: string
          updated_at: string
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          assigned_to?: string | null
          closed_at?: string | null
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description: string
          id?: string
          incident_date: string
          investigation_notes?: string | null
          investigation_status?: string | null
          reported_by: string
          severity: Database["public"]["Enums"]["incident_severity"]
          title: string
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          assigned_to?: string | null
          closed_at?: string | null
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description?: string
          id?: string
          incident_date?: string
          investigation_notes?: string | null
          investigation_status?: string | null
          reported_by?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      inspections: {
        Row: {
          area: Database["public"]["Enums"]["area_type"]
          checklist: Json | null
          completed_date: string | null
          created_at: string
          findings_count: number | null
          id: string
          inspector_id: string
          notes: string | null
          planned_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          checklist?: Json | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          inspector_id: string
          notes?: string | null
          planned_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          checklist?: Json | null
          completed_date?: string | null
          created_at?: string
          findings_count?: number | null
          id?: string
          inspector_id?: string
          notes?: string | null
          planned_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risks: {
        Row: {
          area: Database["public"]["Enums"]["area_type"]
          controls: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          probability: number
          residual_risk: Database["public"]["Enums"]["risk_level"]
          responsible_user_id: string | null
          severity: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          controls?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          probability: number
          residual_risk: Database["public"]["Enums"]["risk_level"]
          responsible_user_id?: string | null
          severity: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          controls?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          probability?: number
          residual_risk?: Database["public"]["Enums"]["risk_level"]
          responsible_user_id?: string | null
          severity?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_hours: number | null
          expiry_months: number | null
          id: string
          is_legal_requirement: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_hours?: number | null
          expiry_months?: number | null
          id?: string
          is_legal_requirement?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_hours?: number | null
          expiry_months?: number | null
          id?: string
          is_legal_requirement?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          area: Database["public"]["Enums"]["area_type"] | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin_general" | "admin_area" | "assistant"
      area_type:
        | "gerencia"
        | "rrhh"
        | "reclutamiento"
        | "prevencion"
        | "operaciones"
        | "comite_paritario"
      document_type:
        | "riohs"
        | "procedimiento"
        | "acta"
        | "informe"
        | "capacitacion"
        | "otro"
      incident_severity: "leve" | "moderado" | "grave" | "catastrofico"
      risk_level: "bajo" | "medio" | "alto" | "critico"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin_general", "admin_area", "assistant"],
      area_type: [
        "gerencia",
        "rrhh",
        "reclutamiento",
        "prevencion",
        "operaciones",
        "comite_paritario",
      ],
      document_type: [
        "riohs",
        "procedimiento",
        "acta",
        "informe",
        "capacitacion",
        "otro",
      ],
      incident_severity: ["leve", "moderado", "grave", "catastrofico"],
      risk_level: ["bajo", "medio", "alto", "critico"],
    },
  },
} as const
