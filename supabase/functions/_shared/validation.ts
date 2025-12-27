/**
 * Server-side validation middleware for edge functions
 * Provides consistent validation, error handling, and rate limiting
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
}

// Default rate limits per endpoint type
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth-related endpoints - stricter limits
  "password_reset": { endpoint: "password_reset", maxRequests: 3, windowSeconds: 3600 },
  "create_admin": { endpoint: "create_admin", maxRequests: 5, windowSeconds: 3600 },
  
  // Payment endpoints - moderate limits
  "checkout": { endpoint: "checkout", maxRequests: 10, windowSeconds: 60 },
  "subscription": { endpoint: "subscription", maxRequests: 20, windowSeconds: 60 },
  "customer_portal": { endpoint: "customer_portal", maxRequests: 10, windowSeconds: 60 },
  
  // General API endpoints
  "compatibility": { endpoint: "compatibility", maxRequests: 30, windowSeconds: 60 },
  "welcome_email": { endpoint: "welcome_email", maxRequests: 5, windowSeconds: 3600 },
  
  // Default fallback
  "default": { endpoint: "default", maxRequests: 60, windowSeconds: 60 },
};

/**
 * Creates a Supabase admin client for rate limiting checks
 */
export function createAdminClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );
}

/**
 * Database-backed rate limiting using the rate_limits table
 * Returns true if request is allowed, false if rate limited
 */
export async function checkDatabaseRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining?: number; resetAt?: string }> {
  try {
    const { data: isAllowed, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: config.endpoint,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds
    });

    if (error) {
      console.error(`[RATE-LIMIT] Database error: ${error.message}`);
      // On error, allow the request but log it
      return { allowed: true };
    }

    return { allowed: isAllowed === true };
  } catch (error) {
    console.error(`[RATE-LIMIT] Check failed: ${error}`);
    // On error, allow the request but log it
    return { allowed: true };
  }
}

/**
 * Get client identifier for rate limiting (IP address or user ID)
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfIp = req.headers.get("cf-connecting-ip");
  
  const ip = cfIp || realIp || (forwarded ? forwarded.split(",")[0].trim() : null) || "unknown";
  return `ip:${ip}`;
}

/**
 * Creates a rate limit exceeded response with retry-after header
 */
export function createRateLimitResponse(
  corsHeaders: Record<string, string>,
  retryAfterSeconds = 60
): Response {
  return new Response(
    JSON.stringify({ 
      error: "Too many requests. Please try again later.",
      retryAfter: retryAfterSeconds 
    }),
    {
      status: 429,
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds)
      },
    }
  );
}

/**
 * Sanitizes a string by removing potentially dangerous content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Validates an email address
 */
export function validateEmail(email: unknown): ValidationResult<string> {
  if (typeof email !== "string") {
    return { success: false, errors: [{ field: "email", message: "Email must be a string" }] };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    return { success: false, errors: [{ field: "email", message: "Email is required" }] };
  }
  
  if (trimmed.length > 255) {
    return { success: false, errors: [{ field: "email", message: "Email must be less than 255 characters" }] };
  }
  
  if (!EMAIL_REGEX.test(trimmed)) {
    return { success: false, errors: [{ field: "email", message: "Invalid email format" }] };
  }
  
  return { success: true, data: trimmed };
}

/**
 * Validates a UUID
 */
export function validateUuid(uuid: unknown, fieldName = "id"): ValidationResult<string> {
  if (typeof uuid !== "string") {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be a string` }] };
  }
  
  if (!UUID_REGEX.test(uuid)) {
    return { success: false, errors: [{ field: fieldName, message: `Invalid ${fieldName} format` }] };
  }
  
  return { success: true, data: uuid };
}

/**
 * Validates a string with length constraints
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult<string> {
  const { minLength = 0, maxLength = 10000, required = false } = options;
  
  if (value === null || value === undefined) {
    if (required) {
      return { success: false, errors: [{ field: fieldName, message: `${fieldName} is required` }] };
    }
    return { success: true, data: "" };
  }
  
  if (typeof value !== "string") {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be a string` }] };
  }
  
  const sanitized = sanitizeString(value);
  
  if (required && !sanitized) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} is required` }] };
  }
  
  if (sanitized.length < minLength) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be at least ${minLength} characters` }] };
  }
  
  if (sanitized.length > maxLength) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be less than ${maxLength} characters` }] };
  }
  
  return { success: true, data: sanitized };
}

/**
 * Validates a number with range constraints
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number; required?: boolean; integer?: boolean } = {}
): ValidationResult<number> {
  const { min, max, required = false, integer = false } = options;
  
  if (value === null || value === undefined) {
    if (required) {
      return { success: false, errors: [{ field: fieldName, message: `${fieldName} is required` }] };
    }
    return { success: true, data: 0 };
  }
  
  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (typeof num !== "number" || isNaN(num)) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be a number` }] };
  }
  
  if (integer && !Number.isInteger(num)) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be a whole number` }] };
  }
  
  if (min !== undefined && num < min) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be at least ${min}` }] };
  }
  
  if (max !== undefined && num > max) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be at most ${max}` }] };
  }
  
  return { success: true, data: num };
}

/**
 * Validates an enum value
 */
export function validateEnum<T extends string>(
  value: unknown,
  fieldName: string,
  allowedValues: readonly T[]
): ValidationResult<T> {
  if (typeof value !== "string") {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be a string` }] };
  }
  
  if (!allowedValues.includes(value as T)) {
    return { success: false, errors: [{ field: fieldName, message: `Invalid ${fieldName}. Allowed values: ${allowedValues.join(", ")}` }] };
  }
  
  return { success: true, data: value as T };
}

/**
 * Validates an array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator: (item: unknown) => ValidationResult<T>,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): ValidationResult<T[]> {
  const { minLength = 0, maxLength = 100, required = false } = options;
  
  if (!Array.isArray(value)) {
    if (required) {
      return { success: false, errors: [{ field: fieldName, message: `${fieldName} must be an array` }] };
    }
    return { success: true, data: [] };
  }
  
  if (value.length < minLength) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must have at least ${minLength} items` }] };
  }
  
  if (value.length > maxLength) {
    return { success: false, errors: [{ field: fieldName, message: `${fieldName} must have at most ${maxLength} items` }] };
  }
  
  const results: T[] = [];
  const errors: ValidationError[] = [];
  
  for (let i = 0; i < value.length; i++) {
    const result = itemValidator(value[i]);
    if (result.success && result.data !== undefined) {
      results.push(result.data);
    } else if (result.errors) {
      errors.push(...result.errors.map(e => ({ ...e, field: `${fieldName}[${i}].${e.field}` })));
    }
  }
  
  if (errors.length > 0) {
    return { success: false, errors };
  }
  
  return { success: true, data: results };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  errors?: ValidationError[],
  status = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: errors,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(data: T, status = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * In-memory rate limiting (fallback for simple cases)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkInMemoryRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Validates request body exists and is JSON
 */
export async function parseRequestBody<T>(req: Request): Promise<ValidationResult<T>> {
  try {
    const body = await req.json();
    return { success: true, data: body as T };
  } catch {
    return { 
      success: false, 
      errors: [{ field: "body", message: "Invalid JSON in request body" }] 
    };
  }
}

/**
 * Validates authorization header and returns token
 */
export function validateAuthHeader(authHeader: string | null): ValidationResult<string> {
  if (!authHeader) {
    return { success: false, errors: [{ field: "authorization", message: "Missing authorization header" }] };
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    return { success: false, errors: [{ field: "authorization", message: "Invalid authorization format" }] };
  }
  
  const token = authHeader.slice(7);
  if (!token || token.length < 10) {
    return { success: false, errors: [{ field: "authorization", message: "Invalid token" }] };
  }
  
  return { success: true, data: token };
}
