-- Update discoverable profiles to exclude paused users
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
AS $function$
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
    AND COALESCE(p.is_paused, false) = false  -- Exclude paused users
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users bu
      WHERE (bu.blocked_by = auth.uid() AND bu.user_id = p.id)
         OR (bu.blocked_by = p.id AND bu.user_id = auth.uid())
    )
  -- Trust-weighted matching: order by visibility score
  ORDER BY COALESCE(urp.visibility_score, 1.0) DESC, p.created_at DESC;
$function$;