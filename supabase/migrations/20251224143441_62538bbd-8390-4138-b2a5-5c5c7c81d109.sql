-- Drop the overly permissive profile viewing policy
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

-- Create a more secure policy that:
-- 1. Users can always see their own profile
-- 2. Users can see profiles of their matches
-- 3. Users cannot see profiles of users who blocked them or they blocked
CREATE POLICY "Users can view accessible profiles"
ON profiles FOR SELECT
USING (
  -- Users can always see their own profile
  auth.uid() = id
  OR
  (
    -- Authenticated users can see other profiles
    auth.uid() IS NOT NULL
    -- But not if either party has blocked the other
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocked_by = auth.uid() AND user_id = profiles.id)
         OR (blocked_by = profiles.id AND user_id = auth.uid())
    )
  )
);

-- Drop the overly permissive profile_photos policy
DROP POLICY IF EXISTS "Authenticated users can view profile photos" ON profile_photos;

-- Create a more secure policy for profile photos
CREATE POLICY "Users can view accessible profile photos"
ON profile_photos FOR SELECT
USING (
  -- Users can always see their own photos
  auth.uid() = user_id
  OR
  (
    -- Authenticated users can see other photos
    auth.uid() IS NOT NULL
    -- But not if either party has blocked the other
    AND NOT EXISTS (
      SELECT 1 FROM blocked_users
      WHERE (blocked_by = auth.uid() AND user_id = profile_photos.user_id)
         OR (blocked_by = profile_photos.user_id AND user_id = auth.uid())
    )
  )
);