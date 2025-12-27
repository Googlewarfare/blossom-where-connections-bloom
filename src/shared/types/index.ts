/**
 * Shared Types
 * 
 * Common type definitions used across features.
 */

// Re-export database types for convenience
export type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// User profile types
export interface UserProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  occupation: string | null;
  verified: boolean;
  verification_status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Match types
export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  read_at: string | null;
  created_at: string;
  deleted: boolean;
  edited_at: string | null;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: "match" | "message" | "profile_view" | "super_like";
  title: string;
  message: string;
  related_user_id: string | null;
  read: boolean;
  created_at: string;
}
