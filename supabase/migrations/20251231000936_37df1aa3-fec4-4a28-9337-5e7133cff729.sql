-- Add intentional_member column to user_response_patterns for tracking membership
ALTER TABLE public.user_response_patterns 
ADD COLUMN IF NOT EXISTS is_intentional_member BOOLEAN DEFAULT false;

-- Update get_discoverable_profiles to give priority to intentional members
CREATE OR REPLACE FUNCTION public.get_discoverable_profiles()
RETURNS TABLE(
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
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
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
    AND COALESCE(p.is_paused, false) = false
    -- Filter out very low trust users (below 20)
    AND COALESCE(urp.internal_trust_score, 50) >= 20
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users bu
      WHERE (bu.blocked_by = auth.uid() AND bu.user_id = p.id)
         OR (bu.blocked_by = p.id AND bu.user_id = auth.uid())
    )
  -- Priority ordering:
  -- 1. Intentional members with high trust first (priority trust visibility benefit)
  -- 2. Then by internal trust score
  -- 3. Then by creation date
  ORDER BY 
    -- Intentional members with good trust get priority visibility (the paid benefit)
    CASE WHEN COALESCE(urp.is_intentional_member, false) AND COALESCE(urp.internal_trust_score, 50) >= 50 
         THEN 1 ELSE 2 END,
    -- Then by trust score
    COALESCE(urp.internal_trust_score, 50) DESC, 
    p.created_at DESC;
$$;