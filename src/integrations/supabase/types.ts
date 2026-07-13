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
      bookings: {
        Row: {
          booking_type: Database["public"]["Enums"]["booking_type"]
          created_at: string
          curriculum: string | null
          duration_minutes: number
          email: string
          google_event_id: string | null
          grade: string | null
          id: string
          meet_link: string | null
          meeting_date: string
          meeting_time: string
          notes: string | null
          parent_name: string | null
          payment_id: string | null
          payment_status: string | null
          phone: string | null
          plan_amount: number | null
          plan_duration: string | null
          plan_name: string | null
          status: Database["public"]["Enums"]["booking_status"]
          student_name: string
          subject: string | null
          timezone: string
          tutor_email: string | null
          updated_at: string
        }
        Insert: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          curriculum?: string | null
          duration_minutes?: number
          email: string
          google_event_id?: string | null
          grade?: string | null
          id?: string
          meet_link?: string | null
          meeting_date: string
          meeting_time: string
          notes?: string | null
          parent_name?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          plan_amount?: number | null
          plan_duration?: string | null
          plan_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_name: string
          subject?: string | null
          timezone?: string
          tutor_email?: string | null
          updated_at?: string
        }
        Update: {
          booking_type?: Database["public"]["Enums"]["booking_type"]
          created_at?: string
          curriculum?: string | null
          duration_minutes?: number
          email?: string
          google_event_id?: string | null
          grade?: string | null
          id?: string
          meet_link?: string | null
          meeting_date?: string
          meeting_time?: string
          notes?: string | null
          parent_name?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          plan_amount?: number | null
          plan_duration?: string | null
          plan_name?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_name?: string
          subject?: string | null
          timezone?: string
          tutor_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tutor_applications: {
        Row: {
          admin_notes: string | null
          availability: string | null
          country: string | null
          created_at: string
          email: string
          experience: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_location: string | null
          qualification: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          subjects: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          availability?: string | null
          country?: string | null
          created_at?: string
          email: string
          experience?: string | null
          full_name: string
          id?: string
          phone?: string | null
          preferred_location?: string | null
          qualification?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          subjects?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          availability?: string | null
          country?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_location?: string | null
          qualification?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          subjects?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      application_status: "pending" | "approved" | "rejected"
      booking_status: "scheduled" | "completed" | "cancelled"
      booking_type: "demo" | "paid"
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
      app_role: ["admin", "moderator", "user"],
      application_status: ["pending", "approved", "rejected"],
      booking_status: ["scheduled", "completed", "cancelled"],
      booking_type: ["demo", "paid"],
    },
  },
} as const
