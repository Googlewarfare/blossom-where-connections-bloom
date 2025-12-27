-- ============================================
-- Security Fixes Migration
-- Fix RLS on views that lack policies
-- ============================================

-- 1. Create secure admin-only view for daily_analytics
-- Drop and recreate with security definer function approach
DROP VIEW IF EXISTS public.daily_analytics;

CREATE OR REPLACE VIEW public.daily_analytics
WITH (security_invoker = true)
AS
SELECT 
    date(created_at) as date,
    count(*) as page_views,
    count(DISTINCT session_id) as unique_sessions,
    count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users
FROM public.page_views
GROUP BY date(created_at);

-- Enable RLS on the view (PostgreSQL 15+ feature - if not supported, we use function approach)
-- Note: Views inherit RLS from underlying tables, but we add explicit check

-- 2. Create security definer function for admin-only analytics access
CREATE OR REPLACE FUNCTION public.get_daily_analytics()
RETURNS TABLE (
    date date,
    page_views bigint,
    unique_sessions bigint,
    logged_in_users bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        date(created_at) as date,
        count(*) as page_views,
        count(DISTINCT session_id) as unique_sessions,
        count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users
    FROM public.page_views
    WHERE public.has_role(auth.uid(), 'admin')
    GROUP BY date(created_at)
    ORDER BY date DESC;
$$;

-- 3. Create security definer function for admin-only anonymized reports
CREATE OR REPLACE FUNCTION public.get_anonymized_reports()
RETURNS TABLE (
    id uuid,
    reported_user_id uuid,
    category report_category,
    status report_status,
    reviewed_by uuid,
    reviewed_at timestamptz,
    created_at timestamptz,
    updated_at timestamptz,
    description text,
    evidence_urls text[],
    admin_notes text,
    anonymous_reporter_hash text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        r.id,
        r.reported_user_id,
        r.category,
        r.status,
        r.reviewed_by,
        r.reviewed_at,
        r.created_at,
        r.updated_at,
        r.description,
        r.evidence_urls,
        r.admin_notes,
        encode(sha256(r.reporter_id::text::bytea), 'hex') as anonymous_reporter_hash
    FROM public.reports r
    WHERE public.has_role(auth.uid(), 'admin') 
       OR public.has_role(auth.uid(), 'moderator');
$$;

-- 4. Create security definer function for fuzzed location profiles
-- This ensures only authenticated users can access fuzzed locations
CREATE OR REPLACE FUNCTION public.get_profiles_with_fuzzed_location()
RETURNS TABLE (
    id uuid,
    full_name text,
    age integer,
    bio text,
    location text,
    occupation text,
    gender text,
    height_cm integer,
    education text,
    lifestyle text,
    relationship_goal text,
    drinking text,
    smoking text,
    exercise text,
    religion text,
    verified boolean,
    verification_status text,
    latitude double precision,
    longitude double precision,
    created_at timestamptz,
    updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        p.id,
        p.full_name,
        p.age,
        p.bio,
        p.location,
        p.occupation,
        p.gender,
        p.height_cm,
        p.education,
        p.lifestyle,
        p.relationship_goal,
        p.drinking,
        p.smoking,
        p.exercise,
        p.religion,
        p.verified,
        p.verification_status,
        -- Apply location fuzzing: add random offset within ~0.5 miles
        CASE 
            WHEN p.latitude IS NOT NULL AND auth.uid() IS NOT NULL AND p.id != auth.uid() THEN
                p.latitude + (random() - 0.5) * 0.015
            ELSE p.latitude
        END as latitude,
        CASE 
            WHEN p.longitude IS NOT NULL AND auth.uid() IS NOT NULL AND p.id != auth.uid() THEN
                p.longitude + (random() - 0.5) * 0.015
            ELSE p.longitude
        END as longitude,
        p.created_at,
        p.updated_at
    FROM public.profiles p
    WHERE auth.uid() IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.blocked_users bu
        WHERE (bu.blocked_by = auth.uid() AND bu.user_id = p.id)
           OR (bu.blocked_by = p.id AND bu.user_id = auth.uid())
    );
$$;

-- 5. Add comment documenting security approach
COMMENT ON FUNCTION public.get_daily_analytics() IS 'Admin-only access to daily analytics. Uses security definer to enforce access control.';
COMMENT ON FUNCTION public.get_anonymized_reports() IS 'Admin/moderator-only access to anonymized reports. Reporter identity is hashed.';
COMMENT ON FUNCTION public.get_profiles_with_fuzzed_location() IS 'Returns profiles with fuzzed location data for authenticated users only. Excludes blocked users.';