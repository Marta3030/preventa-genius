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
      candidates: {
        Row: {
          applied_at: string
          cover_letter: string | null
          created_at: string
          cv_url: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          rut: string | null
          score: number | null
          status: string | null
          updated_at: string
          vacancy_id: string | null
        }
        Insert: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          rut?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Update: {
          applied_at?: string
          cover_letter?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          rut?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_meetings: {
        Row: {
          agenda: string | null
          attendees: string[] | null
          created_at: string
          created_by: string
          id: string
          location: string | null
          meeting_date: string
          minutes_doc_id: string | null
          notes: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agenda?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          location?: string | null
          meeting_date: string
          minutes_doc_id?: string | null
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agenda?: string | null
          attendees?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          location?: string | null
          meeting_date?: string
          minutes_doc_id?: string | null
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_meetings_minutes_doc_id_fkey"
            columns: ["minutes_doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          created_at: string
          employee_id: string | null
          end_date: string | null
          id: string
          name: string
          representation: string
          role: string
          start_date: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          end_date?: string | null
          id?: string
          name: string
          representation: string
          role: string
          start_date: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          end_date?: string | null
          id?: string
          name?: string
          representation?: string
          role?: string
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          created_at: string
          id: string
          is_encrypted: boolean | null
          setting_key: string
          setting_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_encrypted?: boolean | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_checks: {
        Row: {
          category: string
          check_code: string
          checked_at: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          legal_reference: string
          notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          check_code: string
          checked_at?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          legal_reference: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          check_code?: string
          checked_at?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          legal_reference?: string
          notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_rules: {
        Row: {
          auto_block: boolean | null
          category: string
          check_query: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          legal_reference: string
          rule_code: string
          severity: string
          title: string
        }
        Insert: {
          auto_block?: boolean | null
          category?: string
          check_query?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          legal_reference: string
          rule_code: string
          severity?: string
          title: string
        }
        Update: {
          auto_block?: boolean | null
          category?: string
          check_query?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          legal_reference?: string
          rule_code?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      contractor_documents: {
        Row: {
          contractor_id: string
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_url: string
          id: string
          issue_date: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          document_name: string
          document_type: string
          expiry_date?: string | null
          file_url: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_documents_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_workers: {
        Row: {
          access_authorized: boolean | null
          contractor_id: string
          created_at: string
          id: string
          induction_completed: boolean | null
          induction_date: string | null
          name: string
          position: string | null
          rut: string
          status: string
        }
        Insert: {
          access_authorized?: boolean | null
          contractor_id: string
          created_at?: string
          id?: string
          induction_completed?: boolean | null
          induction_date?: string | null
          name: string
          position?: string | null
          rut: string
          status?: string
        }
        Update: {
          access_authorized?: boolean | null
          contractor_id?: string
          created_at?: string
          id?: string
          induction_completed?: boolean | null
          induction_date?: string | null
          name?: string
          position?: string | null
          rut?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_workers_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          activity_type: string | null
          business_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          doc_compliance_status: string | null
          id: string
          is_active: boolean | null
          rut: string
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          business_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          doc_compliance_status?: string | null
          id?: string
          is_active?: boolean | null
          rut: string
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          business_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          doc_compliance_status?: string | null
          id?: string
          is_active?: boolean | null
          rut?: string
          trade_name?: string | null
          updated_at?: string
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
      das_documents: {
        Row: {
          content_snapshot: string
          created_at: string
          created_by: string
          employee_id: string
          id: string
          issue_date: string
          pdf_url: string | null
          signature_employee_date: string | null
          signature_employee_url: string | null
          signature_supervisor_date: string | null
          signature_supervisor_id: string | null
          signature_supervisor_url: string | null
          status: string
          template_id: string | null
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          content_snapshot: string
          created_at?: string
          created_by: string
          employee_id: string
          id?: string
          issue_date?: string
          pdf_url?: string | null
          signature_employee_date?: string | null
          signature_employee_url?: string | null
          signature_supervisor_date?: string | null
          signature_supervisor_id?: string | null
          signature_supervisor_url?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          content_snapshot?: string
          created_at?: string
          created_by?: string
          employee_id?: string
          id?: string
          issue_date?: string
          pdf_url?: string | null
          signature_employee_date?: string | null
          signature_employee_url?: string | null
          signature_supervisor_date?: string | null
          signature_supervisor_id?: string | null
          signature_supervisor_url?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "das_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "das_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "das_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      das_templates: {
        Row: {
          area: string | null
          content_html: string
          controls_summary: string[] | null
          created_at: string
          created_by: string
          epp_required: string[] | null
          id: string
          is_active: boolean | null
          position: string | null
          risks_summary: string[] | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          area?: string | null
          content_html: string
          controls_summary?: string[] | null
          created_at?: string
          created_by: string
          epp_required?: string[] | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          risks_summary?: string[] | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          area?: string | null
          content_html?: string
          controls_summary?: string[] | null
          created_at?: string
          created_by?: string
          epp_required?: string[] | null
          id?: string
          is_active?: boolean | null
          position?: string | null
          risks_summary?: string[] | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
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
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          file_hash: string | null
          file_url: string
          id: string
          notes: string | null
          status: string | null
          uploaded_by: string
          version: number
        }
        Insert: {
          created_at?: string
          document_id: string
          file_hash?: string | null
          file_url: string
          id?: string
          notes?: string | null
          status?: string | null
          uploaded_by: string
          version: number
        }
        Update: {
          created_at?: string
          document_id?: string
          file_hash?: string | null
          file_url?: string
          id?: string
          notes?: string | null
          status?: string | null
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
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
          effective_date: string | null
          expiry_date: string | null
          file_hash: string | null
          file_url: string
          id: string
          is_active: boolean
          notify_all: boolean | null
          owner_area: string | null
          registered_with_dt: boolean | null
          title: string
          updated_at: string
          uploaded_by: string
          version: number
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          effective_date?: string | null
          expiry_date?: string | null
          file_hash?: string | null
          file_url: string
          id?: string
          is_active?: boolean
          notify_all?: boolean | null
          owner_area?: string | null
          registered_with_dt?: boolean | null
          title: string
          updated_at?: string
          uploaded_by: string
          version?: number
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          effective_date?: string | null
          expiry_date?: string | null
          file_hash?: string | null
          file_url?: string
          id?: string
          is_active?: boolean
          notify_all?: boolean | null
          owner_area?: string | null
          registered_with_dt?: boolean | null
          title?: string
          updated_at?: string
          uploaded_by?: string
          version?: number
        }
        Relationships: []
      }
      dt_registration_tasks: {
        Row: {
          confirmed_at: string | null
          created_at: string
          created_by: string
          document_id: string
          dt_folio: string | null
          export_package_url: string | null
          id: string
          notes: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          created_by: string
          document_id: string
          dt_folio?: string | null
          export_package_url?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          created_by?: string
          document_id?: string
          dt_folio?: string | null
          export_package_url?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dt_registration_tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
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
      environmental_aspects: {
        Row: {
          area: string | null
          aspect_type: string
          controls: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          impact_type: string
          legal_requirements: string | null
          name: string
          responsible_id: string | null
          significance_level: string
          status: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          aspect_type?: string
          controls?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          impact_type: string
          legal_requirements?: string | null
          name: string
          responsible_id?: string | null
          significance_level?: string
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          aspect_type?: string
          controls?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          impact_type?: string
          legal_requirements?: string | null
          name?: string
          responsible_id?: string | null
          significance_level?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      environmental_incidents: {
        Row: {
          area: string | null
          created_at: string
          description: string
          environmental_impact: string | null
          id: string
          immediate_actions: string | null
          incident_date: string
          incident_type: string
          location: string | null
          photos: string[] | null
          reported_by: string
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          description: string
          environmental_impact?: string | null
          id?: string
          immediate_actions?: string | null
          incident_date: string
          incident_type: string
          location?: string | null
          photos?: string[] | null
          reported_by: string
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          description?: string
          environmental_impact?: string | null
          id?: string
          immediate_actions?: string | null
          incident_date?: string
          incident_type?: string
          location?: string | null
          photos?: string[] | null
          reported_by?: string
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      epp_allocations: {
        Row: {
          created_at: string
          delivered_by: string
          delivery_date: string
          employee_id: string
          epp_catalog_id: string
          expiry_date: string | null
          id: string
          notes: string | null
          quantity: number
          receipt_pdf_url: string | null
          signature_date: string | null
          signature_url: string | null
          size: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_by: string
          delivery_date?: string
          employee_id: string
          epp_catalog_id: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          receipt_pdf_url?: string | null
          signature_date?: string | null
          signature_url?: string | null
          size?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_by?: string
          delivery_date?: string
          employee_id?: string
          epp_catalog_id?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          receipt_pdf_url?: string | null
          signature_date?: string | null
          signature_url?: string | null
          size?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "epp_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epp_allocations_epp_catalog_id_fkey"
            columns: ["epp_catalog_id"]
            isOneToOne: false
            referencedRelation: "epp_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      epp_catalog: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          requires_size: boolean | null
          sizes_available: string[] | null
          supplier: string | null
          unit_cost: number | null
          updated_at: string
          useful_life_months: number | null
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requires_size?: boolean | null
          sizes_available?: string[] | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
          useful_life_months?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requires_size?: boolean | null
          sizes_available?: string[] | null
          supplier?: string | null
          unit_cost?: number | null
          updated_at?: string
          useful_life_months?: number | null
        }
        Relationships: []
      }
      epp_stock: {
        Row: {
          area: string | null
          center_id: string | null
          created_at: string
          current_stock: number
          epp_catalog_id: string
          id: string
          min_stock: number
          size: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          center_id?: string | null
          created_at?: string
          current_stock?: number
          epp_catalog_id: string
          id?: string
          min_stock?: number
          size?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          center_id?: string | null
          created_at?: string
          current_stock?: number
          epp_catalog_id?: string
          id?: string
          min_stock?: number
          size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "epp_stock_epp_catalog_id_fkey"
            columns: ["epp_catalog_id"]
            isOneToOne: false
            referencedRelation: "epp_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      epps: {
        Row: {
          created_at: string
          employee_id: string
          epp_catalog_id: string | null
          expiry_date: string | null
          id: string
          issued_at: string
          issued_by: string
          item_code: string | null
          item_name: string
          notes: string | null
          quantity: number
          receipt_pdf_url: string | null
          signature_date: string | null
          signature_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          epp_catalog_id?: string | null
          expiry_date?: string | null
          id?: string
          issued_at?: string
          issued_by: string
          item_code?: string | null
          item_name: string
          notes?: string | null
          quantity?: number
          receipt_pdf_url?: string | null
          signature_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          epp_catalog_id?: string | null
          expiry_date?: string | null
          id?: string
          issued_at?: string
          issued_by?: string
          item_code?: string | null
          item_name?: string
          notes?: string | null
          quantity?: number
          receipt_pdf_url?: string | null
          signature_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "epps_epp_catalog_id_fkey"
            columns: ["epp_catalog_id"]
            isOneToOne: false
            referencedRelation: "epp_catalog"
            referencedColumns: ["id"]
          },
        ]
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
      inspection_results: {
        Row: {
          created_at: string
          findings_summary: string | null
          geolocalization: Json | null
          id: string
          inspection_id: string
          inspector_signature_url: string | null
          offline_sync: boolean | null
          photos: string[] | null
          responses: Json
          synced_at: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          findings_summary?: string | null
          geolocalization?: Json | null
          id?: string
          inspection_id: string
          inspector_signature_url?: string | null
          offline_sync?: boolean | null
          photos?: string[] | null
          responses?: Json
          synced_at?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          findings_summary?: string | null
          geolocalization?: Json | null
          id?: string
          inspection_id?: string
          inspector_signature_url?: string | null
          offline_sync?: boolean | null
          photos?: string[] | null
          responses?: Json
          synced_at?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_results_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_results_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string | null
          fields: Json
          id: string
          is_active: boolean | null
          name: string
          target_areas: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name: string
          target_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          target_areas?: string[] | null
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
      kpi_records: {
        Row: {
          area: Database["public"]["Enums"]["area_type"] | null
          created_at: string
          id: string
          iso_standard: string | null
          kpi_name: string
          kpi_value: number
          metadata: Json | null
          module: string | null
          period_end: string
          period_start: string
        }
        Insert: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          iso_standard?: string | null
          kpi_name: string
          kpi_value: number
          metadata?: Json | null
          module?: string | null
          period_end: string
          period_start: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"] | null
          created_at?: string
          id?: string
          iso_standard?: string | null
          kpi_name?: string
          kpi_value?: number
          metadata?: Json | null
          module?: string | null
          period_end?: string
          period_start?: string
        }
        Relationships: []
      }
      management_actions: {
        Row: {
          action_type: string | null
          approved_at: string | null
          approved_by: string | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          document_id: string | null
          due_date: string | null
          id: string
          notes: string | null
          rejected_reason: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          rejected_reason?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_type?: string | null
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          document_id?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          rejected_reason?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "management_actions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes_actions: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          meeting_id: string | null
          notes: string | null
          owner_id: string | null
          owner_name: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          meeting_id?: string | null
          notes?: string | null
          owner_id?: string | null
          owner_name?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "minutes_actions_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "committee_meetings"
            referencedColumns: ["id"]
          },
        ]
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
      operational_tasks: {
        Row: {
          area: Database["public"]["Enums"]["area_type"]
          assigned_by: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          priority: string
          risk_level: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          area: Database["public"]["Enums"]["area_type"]
          assigned_by: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string
          risk_level?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["area_type"]
          assigned_by?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string
          risk_level?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_signatures: {
        Row: {
          created_at: string
          document_id: string
          employee_id: string
          id: string
          reminder_sent_at: string | null
          requested_at: string
          requested_by: string
          signature_method: string | null
          signed_at: string | null
          signer_ip: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          document_id: string
          employee_id: string
          id?: string
          reminder_sent_at?: string | null
          requested_at?: string
          requested_by: string
          signature_method?: string | null
          signed_at?: string | null
          signer_ip?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string
          employee_id?: string
          id?: string
          reminder_sent_at?: string | null
          requested_at?: string
          requested_by?: string
          signature_method?: string | null
          signed_at?: string | null
          signer_ip?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_signatures_employee_id_fkey"
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
      quality_nonconformities: {
        Row: {
          closed_at: string | null
          code: string
          created_at: string
          description: string
          detected_by: string
          due_date: string | null
          id: string
          immediate_correction: string | null
          nc_type: string
          origin: string
          process: string | null
          responsible_id: string | null
          root_cause: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          code: string
          created_at?: string
          description: string
          detected_by: string
          due_date?: string | null
          id?: string
          immediate_correction?: string | null
          nc_type?: string
          origin: string
          process?: string | null
          responsible_id?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          code?: string
          created_at?: string
          description?: string
          detected_by?: string
          due_date?: string | null
          id?: string
          immediate_correction?: string | null
          nc_type?: string
          origin?: string
          process?: string | null
          responsible_id?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      recruitment_pipeline: {
        Row: {
          candidate_id: string | null
          created_at: string
          evaluation_score: number | null
          id: string
          moved_at: string
          moved_by: string
          notes: string | null
          stage: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          evaluation_score?: number | null
          id?: string
          moved_at?: string
          moved_by: string
          notes?: string | null
          stage: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          evaluation_score?: number | null
          id?: string
          moved_at?: string
          moved_by?: string
          notes?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_pipeline_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
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
      unified_actions: {
        Row: {
          action_type: string
          assigned_by: string
          closed_at: string | null
          code: string
          created_at: string
          description: string | null
          due_date: string
          evidence_urls: string[] | null
          id: string
          module: string
          origin_id: string | null
          origin_type: string | null
          priority: string
          progress_percentage: number | null
          responsible_id: string
          status: string
          title: string
          updated_at: string
          verification_date: string | null
          verification_notes: string | null
          verified_by: string | null
        }
        Insert: {
          action_type?: string
          assigned_by: string
          closed_at?: string | null
          code: string
          created_at?: string
          description?: string | null
          due_date: string
          evidence_urls?: string[] | null
          id?: string
          module?: string
          origin_id?: string | null
          origin_type?: string | null
          priority?: string
          progress_percentage?: number | null
          responsible_id: string
          status?: string
          title: string
          updated_at?: string
          verification_date?: string | null
          verification_notes?: string | null
          verified_by?: string | null
        }
        Update: {
          action_type?: string
          assigned_by?: string
          closed_at?: string | null
          code?: string
          created_at?: string
          description?: string | null
          due_date?: string
          evidence_urls?: string[] | null
          id?: string
          module?: string
          origin_id?: string | null
          origin_type?: string | null
          priority?: string
          progress_percentage?: number | null
          responsible_id?: string
          status?: string
          title?: string
          updated_at?: string
          verification_date?: string | null
          verification_notes?: string | null
          verified_by?: string | null
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
      vacancies: {
        Row: {
          area: string
          closes_at: string | null
          company_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          positions_count: number | null
          published_at: string | null
          requirements: string | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          area: string
          closes_at?: string | null
          company_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          positions_count?: number | null
          published_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          area?: string
          closes_at?: string | null
          company_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          positions_count?: number | null
          published_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      waste_records: {
        Row: {
          area: string | null
          carrier: string | null
          created_at: string
          destination: string | null
          disposal_date: string | null
          disposal_method: string | null
          id: string
          manifest_number: string | null
          quantity: number
          recorded_by: string
          unit: string
          waste_type: string
        }
        Insert: {
          area?: string | null
          carrier?: string | null
          created_at?: string
          destination?: string | null
          disposal_date?: string | null
          disposal_method?: string | null
          id?: string
          manifest_number?: string | null
          quantity: number
          recorded_by: string
          unit?: string
          waste_type: string
        }
        Update: {
          area?: string | null
          carrier?: string | null
          created_at?: string
          destination?: string | null
          disposal_date?: string | null
          disposal_method?: string | null
          id?: string
          manifest_number?: string | null
          quantity?: number
          recorded_by?: string
          unit?: string
          waste_type?: string
        }
        Relationships: []
      }
      workwear_allocations: {
        Row: {
          created_at: string
          delivered_by: string
          delivery_date: string
          employee_id: string
          id: string
          quantity: number
          signature_url: string | null
          size: string | null
          status: string
          workwear_catalog_id: string
        }
        Insert: {
          created_at?: string
          delivered_by: string
          delivery_date?: string
          employee_id: string
          id?: string
          quantity?: number
          signature_url?: string | null
          size?: string | null
          status?: string
          workwear_catalog_id: string
        }
        Update: {
          created_at?: string
          delivered_by?: string
          delivery_date?: string
          employee_id?: string
          id?: string
          quantity?: number
          signature_url?: string | null
          size?: string | null
          status?: string
          workwear_catalog_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workwear_allocations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workwear_allocations_workwear_catalog_id_fkey"
            columns: ["workwear_catalog_id"]
            isOneToOne: false
            referencedRelation: "workwear_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      workwear_catalog: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sizes_available: string[] | null
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sizes_available?: string[] | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sizes_available?: string[] | null
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
      unblock_employee: { Args: { p_employee_id: string }; Returns: boolean }
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
        | "política_sst"
        | "iper"
        | "pise"
        | "protocolo"
        | "auditoria"
        | "procedimiento_seguro"
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
        "política_sst",
        "iper",
        "pise",
        "protocolo",
        "auditoria",
        "procedimiento_seguro",
      ],
      incident_severity: ["leve", "moderado", "grave", "catastrofico"],
      risk_level: ["bajo", "medio", "alto", "critico"],
    },
  },
} as const
