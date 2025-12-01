-- Create storage bucket for chat media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
);

-- Create message_media table
CREATE TABLE public.message_media (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on message_media
ALTER TABLE public.message_media ENABLE ROW LEVEL SECURITY;

-- Users can view media in their conversations
CREATE POLICY "Users can view media in their conversations"
ON public.message_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN matches ma ON ma.id = c.match_id
    WHERE m.id = message_media.message_id
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

-- Users can insert media for their messages
CREATE POLICY "Users can insert media for their messages"
ON public.message_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_media.message_id
    AND m.sender_id = auth.uid()
  )
);

-- Storage policies for chat-media bucket
CREATE POLICY "Users can view chat media in their conversations"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-media' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN matches ma ON ma.id = c.match_id
    WHERE (storage.foldername(name))[1] = m.conversation_id::text
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can upload chat media to their conversations"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches ma ON ma.id = c.match_id
    WHERE c.id::text = (storage.foldername(name))[1]
    AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own chat media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-media' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Enable realtime for message_media
ALTER TABLE public.message_media REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_media;