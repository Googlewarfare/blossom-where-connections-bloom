-- =====================================================
-- SECURITY FIX: Add RLS policies to unprotected tables and views
-- =====================================================

-- 1. FIX: user_trust_signals - restrict to user's own data only
-- Drop existing overly permissive policies if any
DROP POLICY IF EXISTS "Users can view own trust signals" ON public.user_trust_signals;
DROP POLICY IF EXISTS "Users can view all trust signals" ON public.user_trust_signals;
DROP POLICY IF EXISTS "Users can insert own trust signals" ON public.user_trust_signals;
DROP POLICY IF EXISTS "Users can update own trust signals" ON public.user_trust_signals;

-- Create restrictive policies
CREATE POLICY "Users can view own trust signals"
ON public.user_trust_signals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert trust signals"
ON public.user_trust_signals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update own trust signals"
ON public.user_trust_signals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 2. FIX: closure_templates - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view closure templates" ON public.closure_templates;
DROP POLICY IF EXISTS "Authenticated users can view closure templates" ON public.closure_templates;

CREATE POLICY "Authenticated users can view closure templates"
ON public.closure_templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Only admins can modify closure templates
CREATE POLICY "Admins can manage closure templates"
ON public.closure_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. FIX: Secure the views by revoking direct access and using functions
-- Revoke SELECT on views from public/anon - force use of security definer functions
REVOKE SELECT ON public.discoverable_profiles FROM anon, authenticated;
REVOKE SELECT ON public.profiles_with_fuzzed_location FROM anon, authenticated;
REVOKE SELECT ON public.anonymized_reports FROM anon, authenticated;
REVOKE SELECT ON public.daily_analytics FROM anon, authenticated;

-- 4. Create secure function for discoverable_profiles (doesn't exist yet)
CREATE OR REPLACE FUNCTION public.get_discoverable_profiles()
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
  visibility_score numeric,
  shows_up_consistently boolean,
  communicates_with_care boolean,
  thoughtful_closer boolean,
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
    -- Apply location fuzzing for privacy
    CASE 
      WHEN p.latitude IS NOT NULL AND p.id != auth.uid() THEN
        p.latitude + (random() - 0.5) * 0.015
      ELSE p.latitude
    END as latitude,
    CASE 
      WHEN p.longitude IS NOT NULL AND p.id != auth.uid() THEN
        p.longitude + (random() - 0.5) * 0.015
      ELSE p.longitude
    END as longitude,
    COALESCE(urp.visibility_score, 1.0) as visibility_score,
    uts.shows_up_consistently,
    uts.communicates_with_care,
    uts.thoughtful_closer,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  LEFT JOIN public.user_response_patterns urp ON urp.user_id = p.id
  LEFT JOIN public.user_trust_signals uts ON uts.user_id = p.id
  LEFT JOIN public.privacy_settings ps ON ps.user_id = p.id
  WHERE auth.uid() IS NOT NULL
    AND p.id != auth.uid()
    AND COALESCE(ps.show_profile_in_discovery, true) = true
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users bu
      WHERE (bu.blocked_by = auth.uid() AND bu.user_id = p.id)
         OR (bu.blocked_by = p.id AND bu.user_id = auth.uid())
    );
$$;

-- 5. Grant execute permissions on security definer functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_discoverable_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_with_fuzzed_location() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_anonymized_reports() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_analytics() TO authenticated;

-- 6. Add comment explaining the security model
COMMENT ON FUNCTION public.get_discoverable_profiles() IS 
'Secure function to get discoverable profiles with location fuzzing. Replaces direct view access.';

COMMENT ON FUNCTION public.get_profiles_with_fuzzed_location() IS 
'Secure function to get profiles with fuzzed locations. Excludes blocked users.';

COMMENT ON FUNCTION public.get_anonymized_reports() IS 
'Secure function for admins/moderators to view anonymized reports.';

COMMENT ON FUNCTION public.get_daily_analytics() IS 
'Secure function for admins to view daily analytics.';

-- 7. Ensure RLS is enabled on all relevant tables
ALTER TABLE public.user_trust_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closure_templates ENABLE ROW LEVEL SECURITY;