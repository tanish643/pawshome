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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adoption_interests: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          interested_user_id: string
          pet_id: string
          status: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          interested_user_id: string
          pet_id: string
          status?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          interested_user_id?: string
          pet_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adoption_interests_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_interests_interested_user_id_fkey"
            columns: ["interested_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_interests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets_for_adoption"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_1_id: string
          participant_2_id: string
          pet_id: string | null
          pet_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1_id: string
          participant_2_id: string
          pet_id?: string | null
          pet_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1_id?: string
          participant_2_id?: string
          pet_id?: string | null
          pet_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_id_fkey"
            columns: ["participant_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_id_fkey"
            columns: ["participant_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      found_pets: {
        Row: {
          created_at: string | null
          description: string
          finder_id: string
          found_location: string
          found_location_lat: number
          found_location_lng: number
          health_report_url: string | null
          id: string
          image_url: string
          is_claimed: boolean | null
          pet_species: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          finder_id: string
          found_location: string
          found_location_lat: number
          found_location_lng: number
          health_report_url?: string | null
          id?: string
          image_url: string
          is_claimed?: boolean | null
          pet_species: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          finder_id?: string
          found_location?: string
          found_location_lat?: number
          found_location_lng?: number
          health_report_url?: string | null
          id?: string
          image_url?: string
          is_claimed?: boolean | null
          pet_species?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "found_pets_finder_id_fkey"
            columns: ["finder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hosting_pets: {
        Row: {
          amount_per_day: number
          created_at: string | null
          daily_food: string
          health_condition: string
          health_report_url: string | null
          id: string
          is_hosted: boolean | null
          is_vaccinated: boolean | null
          main_image_url: string
          number_of_days: number
          owner_age: number
          owner_id: string
          owner_location: string
          owner_name: string
          pet_age: number | null
          pet_breed: string
          pet_location: string
          pet_name: string
          pet_species: string
          updated_at: string | null
          vaccination_proof_url: string | null
          walking_frequency: string
        }
        Insert: {
          amount_per_day: number
          created_at?: string | null
          daily_food: string
          health_condition: string
          health_report_url?: string | null
          id?: string
          is_hosted?: boolean | null
          is_vaccinated?: boolean | null
          main_image_url: string
          number_of_days: number
          owner_age: number
          owner_id: string
          owner_location: string
          owner_name: string
          pet_age?: number | null
          pet_breed: string
          pet_location: string
          pet_name: string
          pet_species: string
          updated_at?: string | null
          vaccination_proof_url?: string | null
          walking_frequency: string
        }
        Update: {
          amount_per_day?: number
          created_at?: string | null
          daily_food?: string
          health_condition?: string
          health_report_url?: string | null
          id?: string
          is_hosted?: boolean | null
          is_vaccinated?: boolean | null
          main_image_url?: string
          number_of_days?: number
          owner_age?: number
          owner_id?: string
          owner_location?: string
          owner_name?: string
          pet_age?: number | null
          pet_breed?: string
          pet_location?: string
          pet_name?: string
          pet_species?: string
          updated_at?: string | null
          vaccination_proof_url?: string | null
          walking_frequency?: string
        }
        Relationships: [
          {
            foreignKeyName: "hosting_pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lost_pets: {
        Row: {
          created_at: string | null
          description: string
          health_report_url: string | null
          id: string
          image_url: string
          is_found: boolean | null
          lost_location: string
          lost_location_lat: number
          lost_location_lng: number
          owner_id: string
          pet_age: number | null
          pet_breed: string
          pet_name: string
          pet_species: string
          reward_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          health_report_url?: string | null
          id?: string
          image_url: string
          is_found?: boolean | null
          lost_location: string
          lost_location_lat: number
          lost_location_lng: number
          owner_id: string
          pet_age?: number | null
          pet_breed: string
          pet_name: string
          pet_species: string
          reward_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          health_report_url?: string | null
          id?: string
          image_url?: string
          is_found?: boolean | null
          lost_location?: string
          lost_location_lat?: number
          lost_location_lng?: number
          owner_id?: string
          pet_age?: number | null
          pet_breed?: string
          pet_name?: string
          pet_species?: string
          reward_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lost_pets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_text: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_text?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pets_for_adoption: {
        Row: {
          amount: number | null
          created_at: string | null
          daily_food: string
          health_condition: string
          health_report_url: string | null
          id: string
          is_adopted: boolean | null
          is_approved: boolean | null
          is_vaccinated: boolean | null
          main_image_url: string
          owner_age: number
          owner_id: string
          owner_location: string
          owner_name: string
          owner_pet_image_url: string | null
          pet_age: number | null
          pet_breed: string
          pet_location: string
          pet_location_lat: number | null
          pet_location_lng: number | null
          pet_name: string
          pet_species: string
          status: string | null
          updated_at: string | null
          vaccination_proof_url: string | null
          walking_frequency: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          daily_food: string
          health_condition: string
          health_report_url?: string | null
          id?: string
          is_adopted?: boolean | null
          is_approved?: boolean | null
          is_vaccinated?: boolean | null
          main_image_url: string
          owner_age: number
          owner_id: string
          owner_location: string
          owner_name: string
          owner_pet_image_url?: string | null
          pet_age?: number | null
          pet_breed: string
          pet_location: string
          pet_location_lat?: number | null
          pet_location_lng?: number | null
          pet_name: string
          pet_species: string
          status?: string | null
          updated_at?: string | null
          vaccination_proof_url?: string | null
          walking_frequency: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          daily_food?: string
          health_condition?: string
          health_report_url?: string | null
          id?: string
          is_adopted?: boolean | null
          is_approved?: boolean | null
          is_vaccinated?: boolean | null
          main_image_url?: string
          owner_age?: number
          owner_id?: string
          owner_location?: string
          owner_name?: string
          owner_pet_image_url?: string | null
          pet_age?: number | null
          pet_breed?: string
          pet_location?: string
          pet_location_lat?: number | null
          pet_location_lng?: number | null
          pet_name?: string
          pet_species?: string
          status?: string | null
          updated_at?: string | null
          vaccination_proof_url?: string | null
          walking_frequency?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_for_adoption_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string | null
          full_name: string
          id: string
          location: string | null
          profile_image_url: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          full_name: string
          id: string
          location?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          full_name?: string
          id?: string
          location?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
