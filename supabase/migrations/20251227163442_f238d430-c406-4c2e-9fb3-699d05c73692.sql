-- Add manifesto agreement tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manifesto_agreed_at TIMESTAMPTZ;

-- Add 48h reminder tracking to conversations
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Add expected_responder_id to track who should respond next
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS expected_responder_id UUID;

-- Insert new closure template options (if they don't exist)
INSERT INTO public.closure_templates (message, tone, display_order, is_active) 
SELECT 'Not feeling the connection', 'honest', 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.closure_templates WHERE message = 'Not feeling the connection');

INSERT INTO public.closure_templates (message, tone, display_order, is_active) 
SELECT 'Not ready to continue', 'neutral', 7, true
WHERE NOT EXISTS (SELECT 1 FROM public.closure_templates WHERE message = 'Not ready to continue');

INSERT INTO public.closure_templates (message, tone, display_order, is_active) 
SELECT 'Taking a break', 'kind', 8, true
WHERE NOT EXISTS (SELECT 1 FROM public.closure_templates WHERE message = 'Taking a break');

-- Create function to check if user has ghosted conversations (72h+)
CREATE OR REPLACE FUNCTION public.get_ghosted_conversations(p_user_id UUID)
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  hours_since_last_message NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    CASE WHEN m.user1_id = p_user_id THEN m.user2_id ELSE m.user1_id END as other_user_id,
    p.full_name as other_user_name,
    EXTRACT(EPOCH FROM (now() - last_msg.created_at)) / 3600 as hours_since_last_message
  FROM conversations c
  JOIN matches m ON m.id = c.match_id
  JOIN LATERAL (
    SELECT msg.sender_id, msg.created_at
    FROM messages msg
    WHERE msg.conversation_id = c.id AND msg.deleted = false
    ORDER BY msg.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN profiles p ON p.id = (CASE WHEN m.user1_id = p_user_id THEN m.user2_id ELSE m.user1_id END)
  WHERE c.status = 'active'
    AND (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND last_msg.sender_id != p_user_id
    AND EXTRACT(EPOCH FROM (now() - last_msg.created_at)) / 3600 >= 72;
END;
$$;

-- Create function to check if user can access app (no 72h+ ghosted convos)
CREATE OR REPLACE FUNCTION public.can_access_app(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ghosted_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ghosted_count
  FROM public.get_ghosted_conversations(p_user_id);
  
  RETURN ghosted_count = 0;
END;
$$;

-- Update trust score calculation to penalize ghosting more heavily
CREATE OR REPLACE FUNCTION public.calculate_trust_signals(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_complete BOOLEAN;
  v_response_pattern RECORD;
  v_verified BOOLEAN;
  v_ghosted_ratio NUMERIC;
  v_closure_ratio NUMERIC;
  v_avg_response_hours NUMERIC;
BEGIN
  -- Get profile completeness
  SELECT 
    (full_name IS NOT NULL AND bio IS NOT NULL AND age IS NOT NULL AND gender IS NOT NULL) INTO v_profile_complete
  FROM profiles WHERE id = p_user_id;

  -- Get verification status
  SELECT verified INTO v_verified FROM profiles WHERE id = p_user_id;

  -- Get response patterns
  SELECT * INTO v_response_pattern FROM user_response_patterns WHERE user_id = p_user_id;

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

  -- Upsert trust signals
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
    v_avg_response_hours < 24 AND v_ghosted_ratio < 0.1,  -- Responds within 24h and rarely ghosts
    v_avg_response_hours < 48,  -- Generally responsive
    v_closure_ratio > 0.7,  -- Closes most conversations gracefully
    v_ghosted_ratio < 0.05 AND v_closure_ratio > 0.8,  -- Community trusted = almost never ghosts + usually closes well
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

  -- Update visibility score based on trust (heavier ghosting penalty)
  UPDATE user_response_patterns
  SET visibility_score = GREATEST(0.1, 1.0 - (v_ghosted_ratio * 2) + (v_closure_ratio * 0.5))
  WHERE user_id = p_user_id;
END;
$$;

-- Allow conversations table to be updated for closure
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations"
ON public.conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = conversations.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = conversations.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);