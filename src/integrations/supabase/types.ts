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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_messages: {
        Row: {
          created_at: string
          generated_message: string | null
          id: string
          lead_id: string
          message_type: string | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generated_message?: string | null
          id?: string
          lead_id: string
          message_type?: string | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generated_message?: string | null
          id?: string
          lead_id?: string
          message_type?: string | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_summaries: {
        Row: {
          created_at: string
          current_status_summary: string | null
          id: string
          lead_id: string
          lead_summary: string | null
          risk_or_opportunity: string | null
          suggested_next_step: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_status_summary?: string | null
          id?: string
          lead_id: string
          lead_summary?: string | null
          risk_or_opportunity?: string | null
          suggested_next_step?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_status_summary?: string | null
          id?: string
          lead_id?: string
          lead_summary?: string | null
          risk_or_opportunity?: string | null
          suggested_next_step?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_summaries_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          lead_id: string
          priority: string | null
          recommended_action: string | null
          status: string
          task_reason: string | null
          task_title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          lead_id: string
          priority?: string | null
          recommended_action?: string | null
          status?: string
          task_reason?: string | null
          task_title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          lead_id?: string
          priority?: string | null
          recommended_action?: string | null
          status?: string
          task_reason?: string | null
          task_title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_activities: {
        Row: {
          activity_date: string | null
          activity_note: string | null
          activity_type: string | null
          created_at: string
          id: string
          lead_id: string
        }
        Insert: {
          activity_date?: string | null
          activity_note?: string | null
          activity_type?: string | null
          created_at?: string
          id?: string
          lead_id: string
        }
        Update: {
          activity_date?: string | null
          activity_note?: string | null
          activity_type?: string | null
          created_at?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          follow_up_date: string | null
          id: string
          interest: string | null
          lead_source: string | null
          name: string
          notes: string | null
          phone: string | null
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          interest?: string | null
          lead_source?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          interest?: string | null
          lead_source?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      voice_agent_logs: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question: string | null
          related_lead_ids: Json | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question?: string | null
          related_lead_ids?: Json | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question?: string | null
          related_lead_ids?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
