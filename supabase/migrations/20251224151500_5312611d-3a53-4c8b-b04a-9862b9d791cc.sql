-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match', 'message', 'profile_view', 'super_like')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_user_id UUID,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger function for new matches
CREATE OR REPLACE FUNCTION public.notify_on_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Notify user1
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (
    NEW.user1_id,
    'match',
    'New Match!',
    'You have a new match! Start chatting now.',
    NEW.user2_id
  );
  
  -- Notify user2
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (
    NEW.user2_id,
    'match',
    'New Match!',
    'You have a new match! Start chatting now.',
    NEW.user1_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for matches
CREATE TRIGGER on_match_created
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_match();

-- Create trigger function for new messages
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Get the recipient from the conversation
  SELECT 
    CASE 
      WHEN ma.user1_id = NEW.sender_id THEN ma.user2_id
      ELSE ma.user1_id
    END INTO recipient_id
  FROM conversations c
  JOIN matches ma ON c.match_id = ma.id
  WHERE c.id = NEW.conversation_id;
  
  -- Get sender name
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification for recipient
  INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
  VALUES (
    recipient_id,
    'message',
    'New Message',
    COALESCE(sender_name, 'Someone') || ' sent you a message',
    NEW.sender_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for messages
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();

-- Create trigger function for profile views
CREATE OR REPLACE FUNCTION public.notify_on_profile_view()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  viewer_name TEXT;
BEGIN
  -- Get viewer name
  SELECT full_name INTO viewer_name
  FROM profiles
  WHERE id = NEW.viewer_id;
  
  -- Create notification (don't notify if viewing own profile)
  IF NEW.viewer_id != NEW.viewed_user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_user_id)
    VALUES (
      NEW.viewed_user_id,
      'profile_view',
      'Profile View',
      COALESCE(viewer_name, 'Someone') || ' viewed your profile',
      NEW.viewer_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for profile views
CREATE TRIGGER on_profile_view_created
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_profile_view();