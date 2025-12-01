-- Add edited_at and deleted columns to messages table
ALTER TABLE public.messages
ADD COLUMN edited_at timestamp with time zone,
ADD COLUMN deleted boolean NOT NULL DEFAULT false;

-- Create message edit history table
CREATE TABLE public.message_edit_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on message_edit_history
ALTER TABLE public.message_edit_history ENABLE ROW LEVEL SECURITY;

-- Users can view edit history for messages in their conversations
CREATE POLICY "Users can view edit history in their conversations"
ON public.message_edit_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN matches ma ON ma.id = c.match_id
    WHERE m.id = message_edit_history.message_id
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

-- Users can insert edit history for their own messages
CREATE POLICY "Users can insert edit history for own messages"
ON public.message_edit_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_edit_history.message_id
    AND m.sender_id = auth.uid()
  )
);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id);

-- Enable realtime for message_edit_history
ALTER TABLE public.message_edit_history REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_edit_history;