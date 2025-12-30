-- Add internal trust score column (never exposed to users)
ALTER TABLE public.user_response_patterns 
ADD COLUMN IF NOT EXISTS internal_trust_score NUMERIC DEFAULT 50 CHECK (internal_trust_score >= 0 AND internal_trust_score <= 100);

-- Add avoidance pattern tracking
ALTER TABLE public.user_response_patterns 
ADD COLUMN IF NOT EXISTS snooze_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS block_count INTEGER DEFAULT 0;

-- Update the calculate_trust_signals function to compute comprehensive internal trust score
CREATE OR REPLACE FUNCTION public.calculate_trust_signals(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile_complete BOOLEAN;
  v_response_pattern RECORD;
  v_verified BOOLEAN;
  v_ghosted_ratio NUMERIC;
  v_closure_ratio NUMERIC;
  v_avg_response_hours NUMERIC;
  v_report_count INTEGER;
  v_block_count INTEGER;
  v_intent_alignment BOOLEAN;
  v_internal_score NUMERIC;
  v_visibility_score NUMERIC;
BEGIN
  -- Get profile completeness
  SELECT 
    (full_name IS NOT NULL AND bio IS NOT NULL AND age IS NOT NULL AND gender IS NOT NULL) INTO v_profile_complete
  FROM profiles WHERE id = p_user_id;

  -- Get verification status
  SELECT verified INTO v_verified FROM profiles WHERE id = p_user_id;

  -- Get response patterns
  SELECT * INTO v_response_pattern FROM user_response_patterns WHERE user_id = p_user_id;

  -- Count reports against this user
  SELECT COUNT(*) INTO v_report_count
  FROM reports 
  WHERE reported_user_id = p_user_id 
    AND status != 'dismissed';

  -- Count times this user has been blocked
  SELECT COUNT(*) INTO v_block_count
  FROM blocked_users 
  WHERE user_id = p_user_id;

  -- Check intent alignment (has completed intent prompts thoughtfully)
  SELECT COUNT(*) >= 3 INTO v_intent_alignment
  FROM user_intent_prompts
  WHERE user_id = p_user_id
    AND answer IS NOT NULL
    AND LENGTH(answer) >= 50;

  -- Calculate ratios
  IF v_response_pattern IS NOT NULL AND v_response_pattern.total_conversations > 0 THEN
    v_ghosted_ratio := COALESCE(v_response_pattern.ghosted_count::NUMERIC / GREATEST(v_response_pattern.total_conversations, 1), 0);
    v_closure_ratio := COALESCE(v_response_pattern.graceful_closures::NUMERIC / GREATEST(v_response_pattern.total_conversations, 1), 0);
    v_avg_response_hours := COALESCE(v_response_pattern.average_response_time_hours, 24);
  ELSE
    v_ghosted_ratio := 0;
    v_closure_ratio := 0;
    v_avg_response_hours := 24;
  END IF;

  -- Calculate INTERNAL TRUST SCORE (0-100)
  -- Base score: 50
  v_internal_score := 50;

  -- POSITIVE FACTORS (up to +50)
  -- Responsiveness: fast responders get bonus (+15 max)
  IF v_avg_response_hours < 6 THEN
    v_internal_score := v_internal_score + 15;
  ELSIF v_avg_response_hours < 12 THEN
    v_internal_score := v_internal_score + 12;
  ELSIF v_avg_response_hours < 24 THEN
    v_internal_score := v_internal_score + 8;
  ELSIF v_avg_response_hours < 48 THEN
    v_internal_score := v_internal_score + 4;
  END IF;

  -- Respectful closures: graceful closers get bonus (+15 max)
  v_internal_score := v_internal_score + (v_closure_ratio * 15);

  -- Intent alignment: completed thoughtful prompts (+10)
  IF v_intent_alignment THEN
    v_internal_score := v_internal_score + 10;
  END IF;

  -- Profile completeness (+5)
  IF v_profile_complete THEN
    v_internal_score := v_internal_score + 5;
  END IF;

  -- Verified identity (+5)
  IF v_verified THEN
    v_internal_score := v_internal_score + 5;
  END IF;

  -- NEGATIVE FACTORS (up to -50)
  -- Ghosting penalty: each ghost incident = -8 points
  v_internal_score := v_internal_score - (COALESCE(v_response_pattern.ghosted_count, 0) * 8);

  -- Report penalty: each valid report = -10 points
  v_internal_score := v_internal_score - (v_report_count * 10);

  -- Block penalty: each time blocked = -5 points
  v_internal_score := v_internal_score - (v_block_count * 5);

  -- Avoidance pattern (snoozing too often): -3 per snooze beyond first
  IF v_response_pattern IS NOT NULL THEN
    v_internal_score := v_internal_score - (GREATEST(COALESCE(v_response_pattern.snooze_count, 0) - 1, 0) * 3);
  END IF;

  -- Clamp score between 0 and 100
  v_internal_score := GREATEST(0, LEAST(100, v_internal_score));

  -- Calculate visibility score (0.3 to 1.0 based on internal score)
  -- Maps 0-100 internal score to 0.3-1.0 visibility
  v_visibility_score := 0.3 + (v_internal_score / 100) * 0.7;

  -- Upsert response patterns with internal trust score
  INSERT INTO user_response_patterns (
    user_id,
    ghosted_count,
    graceful_closures,
    total_conversations,
    average_response_time_hours,
    visibility_score,
    internal_trust_score,
    report_count,
    block_count,
    last_calculated_at
  ) VALUES (
    p_user_id,
    COALESCE(v_response_pattern.ghosted_count, 0),
    COALESCE(v_response_pattern.graceful_closures, 0),
    COALESCE(v_response_pattern.total_conversations, 0),
    v_avg_response_hours,
    v_visibility_score,
    v_internal_score,
    v_report_count,
    v_block_count,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    visibility_score = v_visibility_score,
    internal_trust_score = v_internal_score,
    report_count = v_report_count,
    block_count = v_block_count,
    last_calculated_at = now();

  -- Upsert trust signals (visible badges)
  INSERT INTO user_trust_signals (
    user_id,
    profile_completeness,
    verified_identity,
    shows_up_consistently,
    communicates_with_care,
    thoughtful_closer,
    community_trusted,
    last_calculated_at
  ) VALUES (
    p_user_id,
    CASE WHEN v_profile_complete THEN 100 ELSE 50 END,
    v_verified,
    v_avg_response_hours < 24 AND v_ghosted_ratio < 0.1,
    v_avg_response_hours < 48,
    v_closure_ratio > 0.7,
    v_ghosted_ratio < 0.05 AND v_closure_ratio > 0.8 AND v_report_count = 0,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    profile_completeness = EXCLUDED.profile_completeness,
    verified_identity = EXCLUDED.verified_identity,
    shows_up_consistently = EXCLUDED.shows_up_consistently,
    communicates_with_care = EXCLUDED.communicates_with_care,
    thoughtful_closer = EXCLUDED.thoughtful_closer,
    community_trusted = EXCLUDED.community_trusted,
    last_calculated_at = now();
END;
$$;

-- Update get_discoverable_profiles to use internal trust score for ordering
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
  -- Order by internal trust score (higher trust = shown first)
  ORDER BY COALESCE(urp.internal_trust_score, 50) DESC, p.created_at DESC;
$$;