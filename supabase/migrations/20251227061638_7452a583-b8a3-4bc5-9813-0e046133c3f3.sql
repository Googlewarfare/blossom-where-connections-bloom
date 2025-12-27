-- Fix profile-photos policies

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can view relevant profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view verification photos" ON storage.objects;

-- Create corrected policy: Users can only view profile photos if:
-- 1. It's their own photo, OR
-- 2. They're matched with the user AND not blocked
CREATE POLICY "Users can view profile photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-photos'
  AND auth.uid() IS NOT NULL
  AND (
    -- Own photos
    (auth.uid())::text = (storage.foldername(name))[1]
    OR (
      -- Photos of users they're matched with (not blocked)
      EXISTS (
        SELECT 1 FROM matches
        WHERE (
          (matches.user1_id = auth.uid() AND (matches.user2_id)::text = (storage.foldername(name))[1])
          OR (matches.user2_id = auth.uid() AND (matches.user1_id)::text = (storage.foldername(name))[1])
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocked_users
        WHERE (
          (blocked_users.blocked_by = auth.uid() AND (blocked_users.user_id)::text = (storage.foldername(name))[1])
          OR (blocked_users.user_id = auth.uid() AND (blocked_users.blocked_by)::text = (storage.foldername(name))[1])
        )
      )
    )
  )
);

-- Admins/moderators can view all photos for moderation purposes
CREATE POLICY "Admins can view all photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'profile-photos'
  AND public.is_admin_or_moderator(auth.uid())
);

-- Admins can manage all photos (for removing inappropriate content)
CREATE POLICY "Admins can delete any photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos'
  AND public.is_admin_or_moderator(auth.uid())
);

-- Fix chat-media delete policy (correct folder structure)
DROP POLICY IF EXISTS "Users can delete their own chat media" ON storage.objects;

CREATE POLICY "Users can delete their own chat media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches ma ON ma.id = c.match_id
    WHERE (c.id)::text = (storage.foldername(name))[1]
      AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
  )
);

-- Admins can view all chat media for moderation
CREATE POLICY "Admins can view all chat media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND public.is_admin_or_moderator(auth.uid())
);

-- Admins can delete chat media for moderation
CREATE POLICY "Admins can delete any chat media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media'
  AND public.is_admin_or_moderator(auth.uid())
);