-- Create message reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('heart', 'like', 'laugh')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Users can view reactions in their conversations
CREATE POLICY "Users can view reactions in their conversations"
ON public.message_reactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    JOIN public.matches ma ON ma.id = c.match_id
    WHERE m.id = message_reactions.message_id
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions in their conversations"
ON public.message_reactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.conversations c ON c.id = m.conversation_id
    JOIN public.matches ma ON ma.id = c.match_id
    WHERE m.id = message_reactions.message_id
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for reactions
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;