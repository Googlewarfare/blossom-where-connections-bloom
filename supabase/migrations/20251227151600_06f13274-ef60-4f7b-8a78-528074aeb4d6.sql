-- Function to detect ghosted conversations and update response patterns
CREATE OR REPLACE FUNCTION public.detect_and_record_ghosting()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_record RECORD;
  v_ghosted_count INTEGER;
  v_graceful_count INTEGER;
  v_total_convos INTEGER;
  v_avg_response_hours NUMERIC;
  v_visibility_score NUMERIC;
BEGIN
  -- For each user, calculate their ghosting behavior
  FOR v_user_record IN 
    SELECT DISTINCT 
      CASE WHEN m.user1_id = c.closed_by THEN m.user2_id 
           WHEN m.user2_id = c.closed_by THEN m.user1_id
           ELSE m.user1_id END as user_id
    FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.status IN ('active', 'closed', 'archived')
    UNION
    SELECT DISTINCT m.user1_id FROM matches m
    UNION
    SELECT DISTINCT m.user2_id FROM matches m
  LOOP
    -- Count ghosted conversations (inactive for 7+ days without closure, where they should have responded)
    SELECT COUNT(*) INTO v_ghosted_count
    FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE (m.user1_id = v_user_record.user_id OR m.user2_id = v_user_record.user_id)
      AND c.status = 'active'
      AND c.updated_at < NOW() - INTERVAL '7 days'
      AND EXISTS (
        SELECT 1 FROM messages msg
        WHERE msg.conversation_id = c.id
          AND msg.sender_id != v_user_record.user_id
          AND msg.created_at > c.updated_at - INTERVAL '7 days'
      );
    
    -- Count graceful closures
    SELECT COUNT(*) INTO v_graceful_count
    FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE (m.user1_id = v_user_record.user_id OR m.user2_id = v_user_record.user_id)
      AND c.closed_by = v_user_record.user_id
      AND c.closure_message IS NOT NULL;
    
    -- Count total conversations
    SELECT COUNT(*) INTO v_total_convos
    FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE m.user1_id = v_user_record.user_id OR m.user2_id = v_user_record.user_id;
    
    -- Calculate average response time (simplified)
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) / 3600), 12)
    INTO v_avg_response_hours
    FROM messages m1
    JOIN messages m2 ON m1.conversation_id = m2.conversation_id
    WHERE m2.sender_id = v_user_record.user_id
      AND m1.sender_id != v_user_record.user_id
      AND m2.created_at > m1.created_at
      AND NOT EXISTS (
        SELECT 1 FROM messages m3
        WHERE m3.conversation_id = m1.conversation_id
          AND m3.created_at > m1.created_at
          AND m3.created_at < m2.created_at
      );
    
    -- Calculate visibility score (1.0 = full, 0.3 = minimum)
    -- Each ghost reduces visibility by 15%, each graceful closure adds 5%
    v_visibility_score := GREATEST(0.3, LEAST(1.0, 
      1.0 - (v_ghosted_count * 0.15) + (v_graceful_count * 0.05)
    ));
    
    -- Upsert response patterns
    INSERT INTO user_response_patterns (
      user_id,
      ghosted_count,
      graceful_closures,
      total_conversations,
      average_response_time_hours,
      visibility_score,
      last_calculated_at
    ) VALUES (
      v_user_record.user_id,
      v_ghosted_count,
      v_graceful_count,
      v_total_convos,
      v_avg_response_hours,
      v_visibility_score,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      ghosted_count = EXCLUDED.ghosted_count,
      graceful_closures = EXCLUDED.graceful_closures,
      total_conversations = EXCLUDED.total_conversations,
      average_response_time_hours = EXCLUDED.average_response_time_hours,
      visibility_score = EXCLUDED.visibility_score,
      last_calculated_at = NOW();
  END LOOP;
END;
$function$;

-- Function to get user's visibility score (for use in discovery)
CREATE OR REPLACE FUNCTION public.get_user_visibility_score(p_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_score NUMERIC;
BEGIN
  SELECT COALESCE(visibility_score, 1.0) INTO v_score
  FROM user_response_patterns
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_score, 1.0);
END;
$function$;

-- Function to record a ghost event when conversation goes inactive
CREATE OR REPLACE FUNCTION public.check_inactive_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update conversations that have been inactive for 7+ days as potentially ghosted
  UPDATE conversations c
  SET updated_at = NOW()
  FROM matches m
  WHERE c.match_id = m.id
    AND c.status = 'active'
    AND c.updated_at < NOW() - INTERVAL '7 days';
  
  -- Recalculate ghosting stats
  PERFORM detect_and_record_ghosting();
END;
$function$;

-- Create a view for discovery that factors in visibility scores
CREATE OR REPLACE VIEW public.discoverable_profiles AS
SELECT 
  p.*,
  COALESCE(urp.visibility_score, 1.0) as visibility_score,
  COALESCE(uts.shows_up_consistently, false) as shows_up_consistently,
  COALESCE(uts.communicates_with_care, true) as communicates_with_care,
  COALESCE(uts.thoughtful_closer, false) as thoughtful_closer
FROM profiles p
LEFT JOIN user_response_patterns urp ON p.id = urp.user_id
LEFT JOIN user_trust_signals uts ON p.id = uts.user_id
WHERE p.id != auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM blocked_users bu
    WHERE (bu.blocked_by = auth.uid() AND bu.user_id = p.id)
       OR (bu.blocked_by = p.id AND bu.user_id = auth.uid())
  );

-- Enable RLS on the view by creating policies on base tables (views inherit)
-- The view already filters based on auth.uid() and blocked_users