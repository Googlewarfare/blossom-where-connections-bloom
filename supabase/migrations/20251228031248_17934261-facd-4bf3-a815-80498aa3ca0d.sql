-- Add pause mode fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT;

-- Add notification for closure delivery
CREATE OR REPLACE FUNCTION public.notify_on_conversation_closure()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  other_user_id UUID;
  closer_name TEXT;
BEGIN
  -- Only trigger on close/archive status change
  IF NEW.status IN ('closed', 'archived') AND OLD.status = 'active' AND NEW.closed_by IS NOT NULL THEN
    -- Get the other user in the conversation
    SELECT 
      CASE 
        WHEN m.user1_id = NEW.closed_by THEN m.user2_id
        ELSE m.user1_id
      END INTO other_user_id
    FROM matches m
    WHERE m.id = NEW.match_id;

    -- Get closer's name
    SELECT full_name INTO closer_name
    FROM profiles
    WHERE id = NEW.closed_by;

    -- Create notification for the other user (only for 'closed', not archived)
    IF NEW.status = 'closed' THEN
      INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
      VALUES (
        other_user_id,
        'conversation_closed',
        'Conversation closed',
        COALESCE(closer_name, 'Someone') || ' has thoughtfully ended your conversation. ' || 
        COALESCE('They said: "' || LEFT(NEW.closure_message, 100) || CASE WHEN LENGTH(NEW.closure_message) > 100 THEN '..."' ELSE '"' END, 'No message was included.'),
        NEW.closed_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for closure notifications
DROP TRIGGER IF EXISTS notify_conversation_closure ON conversations;
CREATE TRIGGER notify_conversation_closure
  AFTER UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_conversation_closure();

-- Create function to check if user can pause (must have no active conversations)
CREATE OR REPLACE FUNCTION public.can_pause_dating(p_user_id UUID)
RETURNS TABLE(can_pause BOOLEAN, active_conversation_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM conversations c
  JOIN matches m ON c.match_id = m.id
  WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND c.status = 'active';
  
  RETURN QUERY SELECT (v_count = 0), v_count;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.can_pause_dating(UUID) TO authenticated;