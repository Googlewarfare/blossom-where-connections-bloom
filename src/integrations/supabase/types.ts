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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      background_checks: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          provider: string | null
          status: string
          updated_at: string
          user_id: string
          verification_date: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_date?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_date?: string | null
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_at: string
          blocked_by: string
          id: string
          reason: string | null
          report_id: string | null
          user_id: string
        }
        Insert: {
          blocked_at?: string
          blocked_by: string
          id?: string
          reason?: string | null
          report_id?: string | null
          user_id: string
        }
        Update: {
          blocked_at?: string
          blocked_by?: string
          id?: string
          reason?: string | null
          report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_users_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "anonymized_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocked_users_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      call_signals: {
        Row: {
          call_id: string
          created_at: string
          from_user_id: string
          id: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Insert: {
          call_id: string
          created_at?: string
          from_user_id: string
          id?: string
          signal_data: Json
          signal_type: string
          to_user_id: string
        }
        Update: {
          call_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          signal_data?: Json
          signal_type?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_signals_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "video_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      captcha_verifications: {
        Row: {
          action: string
          expires_at: string | null
          id: string
          ip_address: string | null
          token_hash: string
          verified_at: string | null
        }
        Insert: {
          action: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          token_hash: string
          verified_at?: string | null
        }
        Update: {
          action?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          token_hash?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      closure_templates: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          message: string
          tone: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          message: string
          tone: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          message?: string
          tone?: string
        }
        Relationships: []
      }
      compatibility_scores: {
        Row: {
          calculated_at: string | null
          factors: Json | null
          id: string
          score: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          calculated_at?: string | null
          factors?: Json | null
          id?: string
          score: number
          user1_id: string
          user2_id: string
        }
        Update: {
          calculated_at?: string | null
          factors?: Json | null
          id?: string
          score?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closure_message: string | null
          closure_reason: string | null
          created_at: string
          expected_responder_id: string | null
          id: string
          match_id: string
          reminder_sent_at: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closure_message?: string | null
          closure_reason?: string | null
          created_at?: string
          expected_responder_id?: string | null
          id?: string
          match_id: string
          reminder_sent_at?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closure_message?: string | null
          closure_reason?: string | null
          created_at?: string
          expected_responder_id?: string | null
          id?: string
          match_id?: string
          reminder_sent_at?: string | null
          status?: string | null
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
      daily_questions: {
        Row: {
          category: string
          created_at: string | null
          date: string
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          category: string
          created_at?: string | null
          date: string
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          category?: string
          created_at?: string | null
          date?: string
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      date_checkins: {
        Row: {
          created_at: string
          date_location: string | null
          date_time: string
          expected_end_time: string
          id: string
          last_checkin_at: string | null
          latitude: number | null
          longitude: number | null
          match_id: string | null
          notes: string | null
          status: string
          trusted_contact_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_location?: string | null
          date_time: string
          expected_end_time: string
          id?: string
          last_checkin_at?: string | null
          latitude?: number | null
          longitude?: number | null
          match_id?: string | null
          notes?: string | null
          status?: string
          trusted_contact_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_location?: string | null
          date_time?: string
          expected_end_time?: string
          id?: string
          last_checkin_at?: string | null
          latitude?: number | null
          longitude?: number | null
          match_id?: string | null
          notes?: string | null
          status?: string
          trusted_contact_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_checkins_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "date_checkins_trusted_contact_id_fkey"
            columns: ["trusted_contact_id"]
            isOneToOne: false
            referencedRelation: "trusted_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string
          created_at: string | null
          description: string
          event_date: string
          event_end_date: string | null
          id: string
          image_url: string | null
          latitude: number | null
          location: string
          longitude: number | null
          max_attendees: number | null
          organizer_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          event_date: string
          event_end_date?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          event_date?: string
          event_end_date?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          max_attendees?: number | null
          organizer_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
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
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
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
          duration_seconds: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
          waveform_data: Json | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          message_id: string
          waveform_data?: Json | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
          waveform_data?: Json | null
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
            referencedRelation: "discoverable_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_with_fuzzed_location"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_settings: {
        Row: {
          allow_profile_indexing: boolean
          created_at: string
          id: string
          location_fuzzing_radius_miles: number
          share_activity_with_matches: boolean
          share_interests_publicly: boolean
          show_distance: boolean
          show_exact_location: boolean
          show_last_active: boolean
          show_online_status: boolean
          show_profile_in_discovery: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_profile_indexing?: boolean
          created_at?: string
          id?: string
          location_fuzzing_radius_miles?: number
          share_activity_with_matches?: boolean
          share_interests_publicly?: boolean
          show_distance?: boolean
          show_exact_location?: boolean
          show_last_active?: boolean
          show_online_status?: boolean
          show_profile_in_discovery?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_profile_indexing?: boolean
          created_at?: string
          id?: string
          location_fuzzing_radius_miles?: number
          share_activity_with_matches?: boolean
          share_interests_publicly?: boolean
          show_distance?: boolean
          show_exact_location?: boolean
          show_last_active?: boolean
          show_online_status?: boolean
          show_profile_in_discovery?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "discoverable_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_fuzzed_location"
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
          is_paused: boolean | null
          latitude: number | null
          lifestyle: string | null
          location: string | null
          longitude: number | null
          manifesto_agreed_at: string | null
          occupation: string | null
          pause_reason: string | null
          paused_at: string | null
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
          is_paused?: boolean | null
          latitude?: number | null
          lifestyle?: string | null
          location?: string | null
          longitude?: number | null
          manifesto_agreed_at?: string | null
          occupation?: string | null
          pause_reason?: string | null
          paused_at?: string | null
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
          is_paused?: boolean | null
          latitude?: number | null
          lifestyle?: string | null
          location?: string | null
          longitude?: number | null
          manifesto_agreed_at?: string | null
          occupation?: string | null
          pause_reason?: string | null
          paused_at?: string | null
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
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string
          reported_user_id: string
          reporter_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: Database["public"]["Enums"]["report_category"]
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          reported_user_id: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: Database["public"]["Enums"]["report_category"]
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          reported_user_id?: string
          reporter_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          media_type: string
          media_url: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type: string
          media_url: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          approved: boolean | null
          created_at: string | null
          featured: boolean | null
          id: string
          meet_date: string | null
          photo_url: string | null
          story_text: string
          updated_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          meet_date?: string | null
          photo_url?: string | null
          story_text: string
          updated_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          featured?: boolean | null
          id?: string
          meet_date?: string | null
          photo_url?: string | null
          story_text?: string
          updated_at?: string | null
          user1_id?: string
          user2_id?: string
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
      trusted_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_intent_prompts: {
        Row: {
          answer: string | null
          created_at: string | null
          id: string
          is_public: boolean | null
          prompt_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          prompt_key?: string
          updated_at?: string | null
          user_id?: string
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
            referencedRelation: "discoverable_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_fuzzed_location"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_answers: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_public: boolean | null
          question_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          question_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_public?: boolean | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_response_patterns: {
        Row: {
          average_response_time_hours: number | null
          block_count: number | null
          ghosted_count: number | null
          graceful_closures: number | null
          id: string
          internal_trust_score: number | null
          last_calculated_at: string | null
          report_count: number | null
          snooze_count: number | null
          total_conversations: number | null
          user_id: string
          visibility_score: number | null
        }
        Insert: {
          average_response_time_hours?: number | null
          block_count?: number | null
          ghosted_count?: number | null
          graceful_closures?: number | null
          id?: string
          internal_trust_score?: number | null
          last_calculated_at?: string | null
          report_count?: number | null
          snooze_count?: number | null
          total_conversations?: number | null
          user_id: string
          visibility_score?: number | null
        }
        Update: {
          average_response_time_hours?: number | null
          block_count?: number | null
          ghosted_count?: number | null
          graceful_closures?: number | null
          id?: string
          internal_trust_score?: number | null
          last_calculated_at?: string | null
          report_count?: number | null
          snooze_count?: number | null
          total_conversations?: number | null
          user_id?: string
          visibility_score?: number | null
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
        Relationships: []
      }
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string | null
          device_info: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          os: string | null
          session_token: string
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          session_token: string
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_active_at?: string | null
          location?: string | null
          os?: string | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
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
      user_trust_signals: {
        Row: {
          communicates_with_care: boolean | null
          community_trusted: boolean | null
          id: string
          last_calculated_at: string | null
          profile_completeness: number | null
          shows_up_consistently: boolean | null
          thoughtful_closer: boolean | null
          user_id: string
          verified_identity: boolean | null
        }
        Insert: {
          communicates_with_care?: boolean | null
          community_trusted?: boolean | null
          id?: string
          last_calculated_at?: string | null
          profile_completeness?: number | null
          shows_up_consistently?: boolean | null
          thoughtful_closer?: boolean | null
          user_id: string
          verified_identity?: boolean | null
        }
        Update: {
          communicates_with_care?: boolean | null
          community_trusted?: boolean | null
          id?: string
          last_calculated_at?: string | null
          profile_completeness?: number | null
          shows_up_consistently?: boolean | null
          thoughtful_closer?: boolean | null
          user_id?: string
          verified_identity?: boolean | null
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          caller_id: string
          created_at: string
          ended_at: string | null
          id: string
          match_id: string
          recipient_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          caller_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          match_id: string
          recipient_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          caller_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          match_id?: string
          recipient_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_calls_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      anonymized_reports: {
        Row: {
          admin_notes: string | null
          anonymous_reporter_hash: string | null
          category: Database["public"]["Enums"]["report_category"] | null
          created_at: string | null
          description: string | null
          evidence_urls: string[] | null
          id: string | null
          reported_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          anonymous_reporter_hash?: never
          category?: Database["public"]["Enums"]["report_category"] | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string | null
          reported_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          anonymous_reporter_hash?: never
          category?: Database["public"]["Enums"]["report_category"] | null
          created_at?: string | null
          description?: string | null
          evidence_urls?: string[] | null
          id?: string | null
          reported_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      daily_analytics: {
        Row: {
          date: string | null
          logged_in_users: number | null
          page_views: number | null
          unique_sessions: number | null
        }
        Relationships: []
      }
      discoverable_profiles: {
        Row: {
          age: number | null
          bio: string | null
          communicates_with_care: boolean | null
          created_at: string | null
          drinking: string | null
          education: string | null
          exercise: string | null
          full_name: string | null
          gender: string | null
          height_cm: number | null
          id: string | null
          latitude: number | null
          lifestyle: string | null
          location: string | null
          longitude: number | null
          occupation: string | null
          relationship_goal: string | null
          religion: string | null
          shows_up_consistently: boolean | null
          smoking: string | null
          thoughtful_closer: boolean | null
          updated_at: string | null
          verification_status: string | null
          verified: boolean | null
          visibility_score: number | null
        }
        Relationships: []
      }
      profiles_with_fuzzed_location: {
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
          id: string | null
          latitude: number | null
          lifestyle: string | null
          location: string | null
          longitude: number | null
          occupation: string | null
          relationship_goal: string | null
          religion: string | null
          smoking: string | null
          updated_at: string | null
          verification_status: string | null
          verified: boolean | null
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
          id?: string | null
          latitude?: never
          lifestyle?: string | null
          location?: string | null
          longitude?: never
          occupation?: string | null
          relationship_goal?: string | null
          religion?: string | null
          smoking?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
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
          id?: string | null
          latitude?: never
          lifestyle?: string | null
          location?: string | null
          longitude?: never
          occupation?: string | null
          relationship_goal?: string | null
          religion?: string | null
          smoking?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_trust_signals: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      can_access_app: { Args: { p_user_id: string }; Returns: boolean }
      can_pause_dating: {
        Args: { p_user_id: string }
        Returns: {
          active_conversation_count: number
          can_pause: boolean
        }[]
      }
      can_start_new_conversation: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_account_lockout: {
        Args: {
          p_email: string
          p_lockout_minutes?: number
          p_max_attempts?: number
        }
        Returns: boolean
      }
      check_inactive_conversations: { Args: never; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      cleanup_expired_captcha: { Args: never; Returns: undefined }
      detect_and_record_ghosting: { Args: never; Returns: undefined }
      get_active_conversation_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_anonymized_reports: {
        Args: never
        Returns: {
          admin_notes: string
          anonymous_reporter_hash: string
          category: Database["public"]["Enums"]["report_category"]
          created_at: string
          description: string
          evidence_urls: string[]
          id: string
          reported_user_id: string
          reviewed_at: string
          reviewed_by: string
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }[]
      }
      get_conversations_needing_nudge: {
        Args: never
        Returns: {
          conversation_id: string
          days_inactive: number
          last_message_at: string
          other_user_id: string
          other_user_name: string
          user_to_nudge: string
        }[]
      }
      get_daily_analytics: {
        Args: never
        Returns: {
          date: string
          logged_in_users: number
          page_views: number
          unique_sessions: number
        }[]
      }
      get_discoverable_profiles: {
        Args: never
        Returns: {
          age: number
          bio: string
          communicates_with_care: boolean
          created_at: string
          drinking: string
          education: string
          exercise: string
          full_name: string
          gender: string
          height_cm: number
          id: string
          latitude: number
          lifestyle: string
          location: string
          longitude: number
          occupation: string
          relationship_goal: string
          religion: string
          shows_up_consistently: boolean
          smoking: string
          thoughtful_closer: boolean
          updated_at: string
          verification_status: string
          verified: boolean
          visibility_score: number
        }[]
      }
      get_fuzzed_location: {
        Args: { p_latitude: number; p_longitude: number; p_user_id: string }
        Returns: {
          fuzzed_latitude: number
          fuzzed_longitude: number
        }[]
      }
      get_ghosted_conversations: {
        Args: { p_user_id: string }
        Returns: {
          conversation_id: string
          hours_since_last_message: number
          other_user_id: string
          other_user_name: string
        }[]
      }
      get_profiles_with_fuzzed_location: {
        Args: never
        Returns: {
          age: number
          bio: string
          created_at: string
          drinking: string
          education: string
          exercise: string
          full_name: string
          gender: string
          height_cm: number
          id: string
          latitude: number
          lifestyle: string
          location: string
          longitude: number
          occupation: string
          relationship_goal: string
          religion: string
          smoking: string
          updated_at: string
          verification_status: string
          verified: boolean
        }[]
      }
      get_user_visibility_score: {
        Args: { p_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_ip_address?: string
          p_new_data?: Json
          p_old_data?: Json
          p_record_id?: string
          p_table_name?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      mark_messages_as_read: {
        Args: { p_message_ids: string[] }
        Returns: undefined
      }
      record_login_attempt: {
        Args: { p_email: string; p_ip_address?: string; p_success?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      report_category:
        | "fake_profile"
        | "inappropriate_photos"
        | "harassment"
        | "spam"
        | "scam"
        | "underage"
        | "other"
      report_status: "pending" | "reviewing" | "resolved" | "dismissed"
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
      report_category: [
        "fake_profile",
        "inappropriate_photos",
        "harassment",
        "spam",
        "scam",
        "underage",
        "other",
      ],
      report_status: ["pending", "reviewing", "resolved", "dismissed"],
    },
  },
} as const
