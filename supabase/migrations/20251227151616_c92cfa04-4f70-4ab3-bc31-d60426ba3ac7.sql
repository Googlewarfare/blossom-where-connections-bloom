-- Drop the security definer view and replace with a regular view
DROP VIEW IF EXISTS public.discoverable_profiles;

-- Create view without SECURITY DEFINER (it will use invoker's permissions)
CREATE VIEW public.discoverable_profiles AS
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
  p.latitude,
  p.longitude,
  p.created_at,
  p.updated_at,
  COALESCE(urp.visibility_score, 1.0) as visibility_score,
  COALESCE(uts.shows_up_consistently, false) as shows_up_consistently,
  COALESCE(uts.communicates_with_care, true) as communicates_with_care,
  COALESCE(uts.thoughtful_closer, false) as thoughtful_closer
FROM profiles p
LEFT JOIN user_response_patterns urp ON p.id = urp.user_id
LEFT JOIN user_trust_signals uts ON p.id = uts.user_id;