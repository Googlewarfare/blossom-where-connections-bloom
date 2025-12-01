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
      conversations: {
        Row: {
          created_at: string
          id: string
          match_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      icebreaker_questions: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          question: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      message_edit_history: {
        Row: {
          content: string
          edited_at: string
          id: string
          message_id: string
        }
        Insert: {
          content: string
          edited_at?: string
          id?: string
          message_id: string
        }
        Update: {
          content?: string
          edited_at?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_edit_history_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_media: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_media_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          deleted: boolean
          edited_at: string | null
          id: string
          read: boolean
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          deleted?: boolean
          edited_at?: string | null
          id?: string
          read?: boolean
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          deleted?: boolean
          edited_at?: string | null
          id?: string
          read?: boolean
          read_at?: string | null
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
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          drinking_preference: string[] | null
          education_preference: string[] | null
          exercise_preference: string[] | null
          id: string
          interested_in: string[] | null
          lifestyle_preference: string[] | null
          max_age: number | null
          max_distance: number | null
          max_height_cm: number | null
          min_age: number | null
          min_height_cm: number | null
          relationship_goal_preference: string[] | null
          religion_preference: string[] | null
          show_profiles_within_miles: number | null
          smoking_preference: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          drinking_preference?: string[] | null
          education_preference?: string[] | null
          exercise_preference?: string[] | null
          id?: string
          interested_in?: string[] | null
          lifestyle_preference?: string[] | null
          max_age?: number | null
          max_distance?: number | null
          max_height_cm?: number | null
          min_age?: number | null
          min_height_cm?: number | null
          relationship_goal_preference?: string[] | null
          religion_preference?: string[] | null
          show_profiles_within_miles?: number | null
          smoking_preference?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          drinking_preference?: string[] | null
          education_preference?: string[] | null
          exercise_preference?: string[] | null
          id?: string
          interested_in?: string[] | null
          lifestyle_preference?: string[] | null
          max_age?: number | null
          max_distance?: number | null
          max_height_cm?: number | null
          min_age?: number | null
          min_height_cm?: number | null
          relationship_goal_preference?: string[] | null
          religion_preference?: string[] | null
          show_profiles_within_miles?: number | null
          smoking_preference?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_likes: {
        Row: {
          created_at: string
          id: string
          liked_user_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_user_id: string
          liker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_user_id?: string
          liker_id?: string
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_primary: boolean | null
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          id: string
          viewed_at: string
          viewed_user_id: string
          viewer_id: string
        }
        Insert: {
          id?: string
          viewed_at?: string
          viewed_user_id: string
          viewer_id: string
        }
        Update: {
          id?: string
          viewed_at?: string
          viewed_user_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          bio: string | null
          created_at: string | null
          drinking: string | null
          education: string | null
          exercise: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string
          latitude: number | null
          lifestyle: string | null
          location: string | null
          longitude: number | null
          occupation: string | null
          relationship_goal: string | null
          religion: string | null
          smoking: string | null
          updated_at: string | null
          verification_photo_url: string | null
          verification_status: string | null
          verified: boolean
        }
        Insert: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          drinking?: string | null
          education?: string | null
          exercise?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id: string
          latitude?: number | null
          lifestyle?: string | null
          location?: string | null
          longitude?: number | null
          occupation?: string | null
          relationship_goal?: string | null
          religion?: string | null
          smoking?: string | null
          updated_at?: string | null
          verification_photo_url?: string | null
          verification_status?: string | null
          verified?: boolean
        }
        Update: {
          age?: number | null
          bio?: string | null
          created_at?: string | null
          drinking?: string | null
          education?: string | null
          exercise?: string | null
          full_name?: string | null
          gender?: string | null
          height_cm?: number | null
          id?: string
          latitude?: number | null
          lifestyle?: string | null
          location?: string | null
          longitude?: number | null
          occupation?: string | null
          relationship_goal?: string | null
          religion?: string | null
          smoking?: string | null
          updated_at?: string | null
          verification_photo_url?: string | null
          verification_status?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      super_likes: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_swipes: {
        Row: {
          action_type: string
          created_at: string
          id: string
          target_user_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          target_user_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          target_user_id?: string
          user_id?: string
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
    Enums: {},
  },
} as const
