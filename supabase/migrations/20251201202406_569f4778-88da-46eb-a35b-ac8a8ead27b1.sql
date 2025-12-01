-- Add read_at timestamp to messages table
ALTER TABLE public.messages
ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance on read status
CREATE INDEX idx_messages_conversation_read ON public.messages(conversation_id, read, read_at);

-- Update the existing messages update policy to allow marking messages as read
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
USING (
  auth.uid() = sender_id OR
  EXISTS (
    SELECT 1
    FROM conversations
    JOIN matches ON matches.id = conversations.match_id
    WHERE conversations.id = messages.conversation_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);