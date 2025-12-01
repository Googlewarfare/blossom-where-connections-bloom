-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view conversations from their matches"
  ON public.conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = conversations.match_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert conversations for their matches"
  ON public.conversations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      JOIN matches ON matches.id = conversations.match_id
      WHERE conversations.id = messages.conversation_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      JOIN matches ON matches.id = conversations.match_id
      WHERE conversations.id = conversation_id
        AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Trigger to update conversation timestamp
CREATE TRIGGER update_conversation_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;