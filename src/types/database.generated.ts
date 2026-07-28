export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      additional_works: {
        Row: {
          amount: number
          approved_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["additional_work_status"]
          updated_at: string
          vat_rate: number
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["additional_work_status"]
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          amount?: number
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["additional_work_status"]
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "additional_works_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "additional_works_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          created_at: string
          currency: string
          default_vat_rate: number
          deleted_at: string | null
          dic: string | null
          email: string | null
          iban: string | null
          ico: string | null
          icon_url: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          swift: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: string
          default_vat_rate?: number
          deleted_at?: string | null
          dic?: string | null
          email?: string | null
          iban?: string | null
          ico?: string | null
          icon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          swift?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: string
          default_vat_rate?: number
          deleted_at?: string | null
          dic?: string | null
          email?: string | null
          iban?: string | null
          ico?: string | null
          icon_url?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          swift?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      construction_diary_entries: {
        Row: {
          activities: string | null
          ai_summary: string | null
          created_at: string
          created_by: string | null
          entry_date: string
          equipment_used: string | null
          id: string
          image_urls: string[]
          location: string | null
          materials_used: string | null
          notes: string | null
          problems: string | null
          project_id: string
          rain: boolean
          temperature: number | null
          weather: string | null
          wind: string | null
          workers_count: number
          working_hours: number
        }
        Insert: {
          activities?: string | null
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          equipment_used?: string | null
          id?: string
          image_urls?: string[]
          location?: string | null
          materials_used?: string | null
          notes?: string | null
          problems?: string | null
          project_id: string
          rain?: boolean
          temperature?: number | null
          weather?: string | null
          wind?: string | null
          workers_count?: number
          working_hours?: number
        }
        Update: {
          activities?: string | null
          ai_summary?: string | null
          created_at?: string
          created_by?: string | null
          entry_date?: string
          equipment_used?: string | null
          id?: string
          image_urls?: string[]
          location?: string | null
          materials_used?: string | null
          notes?: string | null
          problems?: string | null
          project_id?: string
          rain?: boolean
          temperature?: number | null
          weather?: string | null
          wind?: string | null
          workers_count?: number
          working_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "construction_diary_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "construction_diary_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          birthday: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          deleted_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_primary: boolean
          last_name: string
          mobile: string | null
          notes: string | null
          phone: string | null
          position: string | null
          preferred_contact: string | null
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean
          last_name: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact?: string | null
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_primary?: boolean
          last_name?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          preferred_contact?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          company: string
          contact_person: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dic: string | null
          email: string | null
          entity_type: Database["public"]["Enums"]["customer_entity_type"]
          iban: string | null
          ico: string | null
          id: string
          notes: string | null
          payment_terms_days: number
          phone: string | null
          swift: string | null
          tags: string[]
          updated_at: string
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dic?: string | null
          email?: string | null
          entity_type?: Database["public"]["Enums"]["customer_entity_type"]
          iban?: string | null
          ico?: string | null
          id?: string
          notes?: string | null
          payment_terms_days?: number
          phone?: string | null
          swift?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          company?: string
          contact_person?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dic?: string | null
          email?: string | null
          entity_type?: Database["public"]["Enums"]["customer_entity_type"]
          iban?: string | null
          ico?: string | null
          id?: string
          notes?: string | null
          payment_terms_days?: number
          phone?: string | null
          swift?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          completed: boolean
          completion_date: string | null
          created_at: string
          created_by: string | null
          customer_confirmed: boolean
          deadline: string | null
          description: string
          handover_id: string | null
          id: string
          photo_url: string | null
          priority: Database["public"]["Enums"]["defect_priority"]
          project_id: string
          responsible: string | null
          status: Database["public"]["Enums"]["defect_status"]
        }
        Insert: {
          completed?: boolean
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_confirmed?: boolean
          deadline?: string | null
          description: string
          handover_id?: string | null
          id?: string
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["defect_priority"]
          project_id: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["defect_status"]
        }
        Update: {
          completed?: boolean
          completion_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_confirmed?: boolean
          deadline?: string | null
          description?: string
          handover_id?: string | null
          id?: string
          photo_url?: string | null
          priority?: Database["public"]["Enums"]["defect_priority"]
          project_id?: string
          responsible?: string | null
          status?: Database["public"]["Enums"]["defect_status"]
        }
        Relationships: [
          {
            foreignKeyName: "defects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_handover_id_fkey"
            columns: ["handover_id"]
            isOneToOne: false
            referencedRelation: "handover_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_sequences: {
        Row: {
          current_number: number
          doc_type: Database["public"]["Enums"]["document_type"]
          id: string
          year: number
        }
        Insert: {
          current_number?: number
          doc_type: Database["public"]["Enums"]["document_type"]
          id?: string
          year: number
        }
        Update: {
          current_number?: number
          doc_type?: Database["public"]["Enums"]["document_type"]
          id?: string
          year?: number
        }
        Relationships: []
      }
      handover_protocols: {
        Row: {
          address: string | null
          completed_work: string | null
          contractor_signature: string | null
          contractor_signed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_signature: string | null
          customer_signed_at: string | null
          equipment_delivered: string | null
          id: string
          keys_handed: string | null
          meters: string | null
          notes: string | null
          number: string
          project_id: string
          protocol_date: string
          protocol_type: Database["public"]["Enums"]["handover_type"]
          responsible_person: string | null
          status: Database["public"]["Enums"]["handover_status"]
          summary: Json | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          completed_work?: string | null
          contractor_signature?: string | null
          contractor_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_signature?: string | null
          customer_signed_at?: string | null
          equipment_delivered?: string | null
          id?: string
          keys_handed?: string | null
          meters?: string | null
          notes?: string | null
          number: string
          project_id: string
          protocol_date?: string
          protocol_type?: Database["public"]["Enums"]["handover_type"]
          responsible_person?: string | null
          status?: Database["public"]["Enums"]["handover_status"]
          summary?: Json | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          completed_work?: string | null
          contractor_signature?: string | null
          contractor_signed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_signature?: string | null
          customer_signed_at?: string | null
          equipment_delivered?: string | null
          id?: string
          keys_handed?: string | null
          meters?: string | null
          notes?: string | null
          number?: string
          project_id?: string
          protocol_date?: string
          protocol_type?: Database["public"]["Enums"]["handover_type"]
          responsible_person?: string | null
          status?: Database["public"]["Enums"]["handover_status"]
          summary?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handover_protocols_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handover_protocols_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handover_protocols_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          position: number
          product_id: string | null
          quantity: number
          unit: string
          unit_price: number
          vat_rate: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          position?: number
          product_id?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          vat_rate?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          position?: number
          product_id?: string | null
          quantity?: number
          unit?: string
          unit_price?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          advance_category: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          deleted_at: string | null
          due_date: string
          iban: string | null
          id: string
          is_advance: boolean
          issue_date: string
          notes: string | null
          number: string
          project_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          swift: string | null
          tax_date: string
          total: number
          updated_at: string
          variable_symbol: string | null
          vat_mode: Database["public"]["Enums"]["vat_mode"]
          vat_note: string | null
          vat_total: number
        }
        Insert: {
          advance_category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          due_date?: string
          iban?: string | null
          id?: string
          is_advance?: boolean
          issue_date?: string
          notes?: string | null
          number: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          swift?: string | null
          tax_date?: string
          total?: number
          updated_at?: string
          variable_symbol?: string | null
          vat_mode?: Database["public"]["Enums"]["vat_mode"]
          vat_note?: string | null
          vat_total?: number
        }
        Update: {
          advance_category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          due_date?: string
          iban?: string | null
          id?: string
          is_advance?: boolean
          issue_date?: string
          notes?: string | null
          number?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          swift?: string | null
          tax_date?: string
          total?: number
          updated_at?: string
          variable_symbol?: string | null
          vat_mode?: Database["public"]["Enums"]["vat_mode"]
          vat_note?: string | null
          vat_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          severity: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          severity?: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          severity?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          code: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          ean: string | null
          id: string
          image_url: string | null
          is_warehouse_item: boolean
          margin: number | null
          min_stock: number
          name: string
          price_with_vat: number | null
          purchase_price: number
          sale_price: number
          sku: string | null
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          supplier_id: string | null
          unit: string
          updated_at: string
          vat_rate: number
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          is_warehouse_item?: boolean
          margin?: number | null
          min_stock?: number
          name: string
          price_with_vat?: number | null
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          ean?: string | null
          id?: string
          image_url?: string | null
          is_warehouse_item?: boolean
          margin?: number | null
          min_stock?: number
          name?: string
          price_with_vat?: number | null
          purchase_price?: number
          sale_price?: number
          sku?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_costs: {
        Row: {
          amount: number
          category: string
          cost_date: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          project_id: string
        }
        Insert: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          project_id: string
        }
        Update: {
          amount?: number
          category?: string
          cost_date?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          budget_amount: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          deleted_at: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          notes: string | null
          number: string
          quotation_id: string | null
          stage: Database["public"]["Enums"]["project_stage"]
          start_date: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          warranty_end_date: string | null
          warranty_months: number
          warranty_start_date: string | null
        }
        Insert: {
          address?: string | null
          budget_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          notes?: string | null
          number: string
          quotation_id?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          warranty_end_date?: string | null
          warranty_months?: number
          warranty_start_date?: string | null
        }
        Update: {
          address?: string | null
          budget_amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          notes?: string | null
          number?: string
          quotation_id?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          warranty_end_date?: string | null
          warranty_months?: number
          warranty_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string | null
          deleted_at: string | null
          id: string
          issue_date: string
          notes: string | null
          number: string
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number
          total: number
          updated_at: string
          valid_until: string | null
          vat_total: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_total?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string | null
          deleted_at?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          number?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          valid_until?: string | null
          vat_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      warehouse_movements: {
        Row: {
          actor_id: string | null
          change: number
          created_at: string
          id: string
          product_id: string
          reason: string | null
        }
        Insert: {
          actor_id?: string | null
          change: number
          created_at?: string
          id?: string
          product_id: string
          reason?: string | null
        }
        Update: {
          actor_id?: string | null
          change?: number
          created_at?: string
          id?: string
          product_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_movements_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_app_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      is_administrator: { Args: never; Returns: boolean }
      next_document_number: {
        Args: { p_doc_type: Database["public"]["Enums"]["document_type"] }
        Returns: string
      }
    }
    Enums: {
      additional_work_status: "proposed" | "approved" | "rejected"
      app_role:
        | "administrator"
        | "manager"
        | "accountant"
        | "warehouse"
        | "sales"
      customer_entity_type:
        | "firma"
        | "osvc"
        | "soukroma_osoba"
        | "dodavatel"
        | "partner"
        | "investor"
        | "developer"
        | "obec_mesto"
        | "organizace"
      defect_priority: "low" | "medium" | "high" | "critical"
      defect_status: "open" | "in_progress" | "completed" | "rejected"
      document_type: "INV" | "ADV" | "QTN" | "ORD" | "DLV" | "PRJ" | "HOV"
      handover_status: "draft" | "signed" | "archived"
      handover_type:
        | "partial"
        | "final"
        | "internal"
        | "subcontractor"
        | "warranty"
        | "acceptance"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      product_status: "active" | "inactive" | "archived"
      project_stage:
        | "lead"
        | "inquiry"
        | "site_visit"
        | "budget"
        | "quotation"
        | "approval"
        | "started"
        | "diary"
        | "warehouse"
        | "delivery_notes"
        | "advance_invoices"
        | "additional_work"
        | "interim_handover"
        | "final_handover"
        | "final_invoice"
        | "warranty"
        | "archived"
      project_status:
        | "planned"
        | "active"
        | "on_hold"
        | "completed"
        | "archived"
      quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "converted"
      vat_mode: "standard" | "reverse_charge" | "oss" | "eu_vat" | "export"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      additional_work_status: ["proposed", "approved", "rejected"],
      app_role: [
        "administrator",
        "manager",
        "accountant",
        "warehouse",
        "sales",
      ],
      customer_entity_type: [
        "firma",
        "osvc",
        "soukroma_osoba",
        "dodavatel",
        "partner",
        "investor",
        "developer",
        "obec_mesto",
        "organizace",
      ],
      defect_priority: ["low", "medium", "high", "critical"],
      defect_status: ["open", "in_progress", "completed", "rejected"],
      document_type: ["INV", "ADV", "QTN", "ORD", "DLV", "PRJ", "HOV"],
      handover_status: ["draft", "signed", "archived"],
      handover_type: [
        "partial",
        "final",
        "internal",
        "subcontractor",
        "warranty",
        "acceptance",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      product_status: ["active", "inactive", "archived"],
      project_stage: [
        "lead",
        "inquiry",
        "site_visit",
        "budget",
        "quotation",
        "approval",
        "started",
        "diary",
        "warehouse",
        "delivery_notes",
        "advance_invoices",
        "additional_work",
        "interim_handover",
        "final_handover",
        "final_invoice",
        "warranty",
        "archived",
      ],
      project_status: ["planned", "active", "on_hold", "completed", "archived"],
      quotation_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "converted",
      ],
      vat_mode: ["standard", "reverse_charge", "oss", "eu_vat", "export"],
    },
  },
} as const

