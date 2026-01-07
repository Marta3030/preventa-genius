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
      alerts: {
        Row: {
          created_at: string
          dismissed_by: string[] | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          message: string
          read_by: string[] | null
          severity: string
          target_areas: Database["public"]["Enums"]["area_type"][] | null
          target_roles: Database["public"]["Enums"]["app_role"][] | null
          target_users: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          dismissed_by?: string[] | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          message: string
          read_by?: string[] | null
          severity?: string
          target_areas?: Database["public"]["Enums"]["area_type"][] | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          target_users?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          dismissed_by?: string[] | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          read_by?: string[] | null
          severity?: string
          target_areas?: Database["public"]["Enums"]["area_type"][] | null
          target_roles?: Database["public"]["Enums"]["app_role"][] | null
          target_users?: string[] | null
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          prev_value: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          prev_value?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          prev_value?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_type: string
          created_at: string
          document_id: string | null
          employee_id: string
          end_date: string | null
          id: string
          salary: number | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          contract_type?: string
          created_at?: string
          document_id?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          salary?: number | null
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          contract_type?: string
          created_at?: string
          document_id?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          salary?: number | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      corrective_actions: {
        Row: {
          action_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          evidence_url: string | null
          id: string
          incident_id: string | null
          investigation_id: string | null
          owner_id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          evidence_url?: string | null
          id?: string
          incident_id?: string | null
          investigation_id?: string | null
          owner_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          evidence_url?: string | null
          id?: string
          incident_id?: string | null
          investigation_id?: string | null
          owner_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corrective_actions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrective_actions_investigation_id_fkey"
            columns: ["investigation_id"]
            isOneToOne: false
            referencedRelation: "incident_investigations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      employee_documents: {
        Row: {
          created_at: string
          document_id: string
          employee_id: string
          id: string
          required: boolean
          signed_at: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          employee_id: string
          id?: string
          required?: boolean
          signed_at?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          employee_id?: string
          id?: string
          required?: boolean
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_health: {
        Row: {
          created_at: string
          document_id: string | null
          employee_id: string
          exam_date: string
          exam_type: string
          id: string
          next_exam_date: string | null
          notes: string | null
          result: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          employee_id: string
          exam_date: string
          exam_type?: string
          id?: string
          next_exam_date?: string | null
          notes?: string | null
          result?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          employee_id?: string
          exam_date?: string
          exam_type?: string
          id?: string
          next_exam_date?: string | null
          notes?: string | null
          result?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_health_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_health_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      employees: {
        Row: {
          area: Database["public"]["Enums"]["area_type"]
          blocked_for_tasks: boolean
          blocked_reason: string | null
          company_id: string | null
          created_at: string
          date_joined: string
          id: string
          name: string
          position: string
          rut: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          blocked_for_tasks?: boolean
          blocked_reason?: string | null
          company_id?: string | null
          created_at?: string
          date_joined?: string
          id?: string
          name: string
          position: string
          rut: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          blocked_for_tasks?: boolean
          blocked_reason?: string | null
          company_id?: string | null
          created_at?: string
          date_joined?: string
          id?: string
          name?: string
          position?: string
          rut?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      epps: {
        Row: {
          created_at: string
          employee_id: string
          expiry_date: string | null
          id: string
          issued_at: string
          issued_by: string
          item_code: string | null
          item_name: string
          notes: string | null
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          issued_at?: string
          issued_by: string
          item_code?: string | null
          item_name: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issued_at?: string
          issued_by?: string
          item_code?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      incident_investigations: {
        Row: {
          completed_at: string | null
          contributing_factors: string[] | null
          created_at: string
          id: string
          immediate_actions: string | null
          incident_id: string
          investigator_id: string
          root_cause: string | null
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          contributing_factors?: string[] | null
          created_at?: string
          id?: string
          immediate_actions?: string | null
          incident_id: string
          investigator_id: string
          root_cause?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          contributing_factors?: string[] | null
          created_at?: string
          id?: string
          immediate_actions?: string | null
          incident_id?: string
          investigator_id?: string
          root_cause?: string | null
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_investigations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
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
          employees_involved: string[] | null
          id: string
          immediate_actions: string | null
          incident_date: string
          investigation_notes: string | null
          investigation_status: string | null
          location: string | null
          photos: string[] | null
          reported_by: string
          severity: Database["public"]["Enums"]["incident_severity"]
          title: string
          type: string | null
          updated_at: string
          witnesses: string[] | null
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          assigned_to?: string | null
          closed_at?: string | null
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description: string
          employees_involved?: string[] | null
          id?: string
          immediate_actions?: string | null
          incident_date: string
          investigation_notes?: string | null
          investigation_status?: string | null
          location?: string | null
          photos?: string[] | null
          reported_by: string
          severity: Database["public"]["Enums"]["incident_severity"]
          title: string
          type?: string | null
          updated_at?: string
          witnesses?: string[] | null
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          assigned_to?: string | null
          closed_at?: string | null
          corrective_actions?: string | null
          created_at?: string
          days_lost?: number | null
          description?: string
          employees_involved?: string[] | null
          id?: string
          immediate_actions?: string | null
          incident_date?: string
          investigation_notes?: string | null
          investigation_status?: string | null
          location?: string | null
          photos?: string[] | null
          reported_by?: string
          severity?: Database["public"]["Enums"]["incident_severity"]
          title?: string
          type?: string | null
          updated_at?: string
          witnesses?: string[] | null
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
      kpi_records: {
        Row: {
          area: Database["public"]["Enums"]["area_type"] | null
          created_at: string
          id: string
          kpi_name: string
          kpi_value: number
          metadata: Json | null
          period_end: string
          period_start: string
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          kpi_name: string
          kpi_value: number
          metadata?: Json | null
          period_end: string
          period_start: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          kpi_name?: string
          kpi_value?: number
          metadata?: Json | null
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      onboarding_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          employee_id: string
          id: string
          notes: string | null
          status: string
          task_name: string
          task_type: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          task_name: string
          task_type?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          task_name?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
          juridical_basis: string | null
          recurrence_days: number | null
          title: string
          type: string | null
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
          juridical_basis?: string | null
          recurrence_days?: number | null
          title: string
          type?: string | null
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
          juridical_basis?: string | null
          recurrence_days?: number | null
          title?: string
          type?: string | null
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
      calculate_prevention_kpis: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: Json
      }
      check_expiring_health_exams: { Args: never; Returns: undefined }
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
