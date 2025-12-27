/**
 * Centralized validation schemas for input sanitization and security
 * All user inputs must be validated before processing
 */

import { z } from "zod";

// =============================================================================
// COMMON SANITIZATION UTILITIES
// =============================================================================

/**
 * Removes potentially dangerous HTML/script content from strings
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

/**
 * Validates and sanitizes URLs
 */
export const sanitizeUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};

// =============================================================================
// COMMON FIELD SCHEMAS
// =============================================================================

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Invalid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password must be less than 100 characters" })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain an uppercase letter",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain a lowercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain a number",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain a special character",
  });

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(100, { message: "Name must be less than 100 characters" })
  .transform(sanitizeString);

export const bioSchema = z
  .string()
  .trim()
  .max(1000, { message: "Bio must be less than 1000 characters" })
  .transform(sanitizeString);

export const locationSchema = z
  .string()
  .trim()
  .max(200, { message: "Location must be less than 200 characters" })
  .transform(sanitizeString);

export const ageSchema = z
  .number({ invalid_type_error: "Age must be a number" })
  .int({ message: "Age must be a whole number" })
  .min(18, { message: "You must be at least 18 years old" })
  .max(120, { message: "Please enter a valid age" });

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s\-()]+$/, { message: "Invalid phone number format" })
  .min(7, { message: "Phone number is too short" })
  .max(20, { message: "Phone number is too long" })
  .optional()
  .nullable();

export const uuidSchema = z.string().uuid({ message: "Invalid ID format" });

// =============================================================================
// AUTHENTICATION SCHEMAS
// =============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }).max(100),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: nameSchema.optional(),
  location: locationSchema.optional(),
});

// =============================================================================
// PROFILE SCHEMAS
// =============================================================================

export const profileUpdateSchema = z.object({
  full_name: nameSchema.optional(),
  age: ageSchema.optional(),
  bio: bioSchema.optional(),
  location: locationSchema.optional(),
  occupation: z
    .string()
    .trim()
    .max(100, { message: "Occupation must be less than 100 characters" })
    .transform(sanitizeString)
    .optional(),
  gender: z
    .enum(["male", "female", "non-binary", "other"], {
      errorMap: () => ({ message: "Invalid gender selection" }),
    })
    .optional(),
  height_cm: z
    .number()
    .int()
    .min(100, { message: "Height must be at least 100 cm" })
    .max(250, { message: "Height must be less than 250 cm" })
    .optional()
    .nullable(),
  education: z.string().max(100).transform(sanitizeString).optional().nullable(),
  lifestyle: z.string().max(100).transform(sanitizeString).optional().nullable(),
  relationship_goal: z.string().max(100).transform(sanitizeString).optional().nullable(),
  drinking: z.string().max(50).transform(sanitizeString).optional().nullable(),
  smoking: z.string().max(50).transform(sanitizeString).optional().nullable(),
  exercise: z.string().max(50).transform(sanitizeString).optional().nullable(),
  religion: z.string().max(100).transform(sanitizeString).optional().nullable(),
});

export const onboardingSchema = z.object({
  age: ageSchema,
  gender: z.enum(["male", "female", "non-binary", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  occupation: z
    .string()
    .trim()
    .max(100, { message: "Occupation must be less than 100 characters" })
    .transform(sanitizeString)
    .optional(),
  bio: z
    .string()
    .trim()
    .min(10, { message: "Bio must be at least 10 characters" })
    .max(1000, { message: "Bio must be less than 1000 characters" })
    .transform(sanitizeString),
  interestedIn: z
    .array(z.enum(["male", "female", "non-binary", "everyone"]))
    .min(1, { message: "Please select at least one preference" }),
  minAge: z.number().int().min(18).max(100),
  maxAge: z.number().int().min(18).max(100),
  maxDistance: z.number().int().min(1).max(500),
});

// =============================================================================
// PREFERENCES SCHEMAS
// =============================================================================

export const preferencesSchema = z.object({
  interested_in: z.array(z.string().max(50)).optional(),
  min_age: z.number().int().min(18).max(100).optional(),
  max_age: z.number().int().min(18).max(100).optional(),
  max_distance: z.number().int().min(1).max(500).optional(),
  min_height_cm: z.number().int().min(100).max(250).optional().nullable(),
  max_height_cm: z.number().int().min(100).max(250).optional().nullable(),
});

// =============================================================================
// REPORT SCHEMAS
// =============================================================================

export const reportCategorySchema = z.enum([
  "fake_profile",
  "inappropriate_photos",
  "harassment",
  "spam",
  "scam",
  "underage",
  "other",
]);

export const reportSchema = z.object({
  reported_user_id: uuidSchema,
  category: reportCategorySchema,
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be less than 2000 characters" })
    .transform(sanitizeString)
    .optional()
    .nullable(),
});

// =============================================================================
// MESSAGE SCHEMAS
// =============================================================================

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(5000, { message: "Message is too long (max 5000 characters)" })
    .transform(sanitizeString),
  conversation_id: uuidSchema,
});

// =============================================================================
// EVENT SCHEMAS
// =============================================================================

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be less than 200 characters" })
    .transform(sanitizeString),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(5000, { message: "Description must be less than 5000 characters" })
    .transform(sanitizeString),
  location: locationSchema,
  category: z.string().min(1).max(50),
  event_date: z.string().datetime({ message: "Invalid date format" }),
  event_end_date: z.string().datetime().optional().nullable(),
  max_attendees: z.number().int().min(1).max(10000).optional().nullable(),
});

// =============================================================================
// TRUSTED CONTACT SCHEMAS
// =============================================================================

export const trustedContactSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().nullable(),
  phone: phoneSchema,
});

// =============================================================================
// DATE CHECKIN SCHEMAS
// =============================================================================

export const dateCheckinSchema = z.object({
  trusted_contact_id: uuidSchema,
  date_time: z.string().datetime(),
  expected_end_time: z.string().datetime(),
  date_location: locationSchema.optional(),
  notes: z.string().max(1000).transform(sanitizeString).optional().nullable(),
  match_id: uuidSchema.optional().nullable(),
});

// =============================================================================
// SEARCH / FILTER SCHEMAS
// =============================================================================

export const searchQuerySchema = z
  .string()
  .trim()
  .max(200, { message: "Search query is too long" })
  .transform(sanitizeString);

export const paginationSchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const imageUploadSchema = z.object({
  fileName: z
    .string()
    .regex(/^[a-zA-Z0-9_\-\.]+$/, { message: "Invalid file name" })
    .max(255),
  fileType: z.enum([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ]),
  fileSize: z
    .number()
    .max(10 * 1024 * 1024, { message: "File must be less than 10MB" }),
});

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validates data against a schema and returns typed result with error messages
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  };
}

/**
 * Validates and throws if invalid (for edge functions)
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Rate limiting helper - checks if action should be allowed
 */
export function isRateLimited(
  timestamps: number[],
  maxActions: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const recentActions = timestamps.filter((t) => now - t < windowMs);
  return recentActions.length >= maxActions;
}
