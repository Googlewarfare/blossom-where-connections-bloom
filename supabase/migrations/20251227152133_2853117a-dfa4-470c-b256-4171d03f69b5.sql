-- Add 'nudge' to notification types by updating the type check or just allowing it
-- Since notifications.type is just TEXT, we can insert 'nudge' directly

-- Create function to find conversations needing nudges
CREATE OR REPLACE FUNCTION public.get_conversations_needing_nudge()
RETURNS TABLE (
  conversation_id UUID,
  user_to_nudge UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message_at TIMESTAMPTZ,
  days_inactive INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH last_messages AS (
    SELECT 
      m.conversation_id,
      m.sender_id,
      m.created_at,
      ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) as rn
    FROM messages m
    WHERE m.deleted = false
  ),
  inactive_convos AS (
    SELECT 
      c.id as conv_id,
      lm.sender_id as last_sender,
      lm.created_at as last_msg_time,
      CASE 
        WHEN ma.user1_id = lm.sender_id THEN ma.user2_id
        ELSE ma.user1_id
      END as should_respond_user,
      CASE 
        WHEN ma.user1_id = lm.sender_id THEN ma.user1_id
        ELSE ma.user2_id
      END as waiting_user
    FROM conversations c
    JOIN matches ma ON c.match_id = ma.id
    JOIN last_messages lm ON lm.conversation_id = c.id AND lm.rn = 1
    WHERE c.status = 'active'
      AND lm.created_at < NOW() - INTERVAL '3 days'
      AND lm.created_at > NOW() - INTERVAL '14 days' -- Don't nudge for very old conversations
  )
  SELECT 
    ic.conv_id,
    ic.should_respond_user,
    ic.waiting_user,
    p.full_name,
    ic.last_msg_time,
    EXTRACT(DAY FROM NOW() - ic.last_msg_time)::INTEGER
  FROM inactive_convos ic
  LEFT JOIN profiles p ON p.id = ic.waiting_user;
END;
$$;