-- Fix #1: Fix the overly permissive messages UPDATE policy
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a policy that only allows senders to update their own messages
CREATE POLICY "Senders can update their own messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Create a function to mark messages as read that validates the caller is a recipient
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(p_message_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update messages where the current user is NOT the sender
  -- and is a participant in the conversation
  UPDATE messages m
  SET read = true, read_at = now()
  WHERE m.id = ANY(p_message_ids)
    AND m.sender_id != auth.uid()
    AND m.read = false
    AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN matches ma ON c.match_id = ma.id
      WHERE c.id = m.conversation_id
        AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
    );
END;
$$;

-- Fix #2: Tighten storage policy for profile-photos
-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;

-- Create a more restrictive policy that allows viewing photos of:
-- 1. Your own photos
-- 2. Photos of users you're matched with
-- 3. Photos needed for discovery (profiles you can view)
CREATE POLICY "Users can view relevant profile photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND (
      -- Own photos
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Matched users' photos
      EXISTS (
        SELECT 1 FROM matches 
        WHERE (user1_id = auth.uid() AND user2_id::text = (storage.foldername(name))[1])
           OR (user2_id = auth.uid() AND user1_id::text = (storage.foldername(name))[1])
      )
      OR
      -- For discovery, allow viewing any non-blocked user's photos
      NOT EXISTS (
        SELECT 1 FROM blocked_users 
        WHERE (blocked_by = auth.uid() AND user_id::text = (storage.foldername(name))[1])
           OR (user_id = auth.uid() AND blocked_by::text = (storage.foldername(name))[1])
      )
    )
  );