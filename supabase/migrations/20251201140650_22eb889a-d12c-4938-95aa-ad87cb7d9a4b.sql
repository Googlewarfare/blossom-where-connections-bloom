-- Drop the existing insecure SELECT policy on profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new secure policy that requires authentication
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Also secure the profile_photos table
DROP POLICY IF EXISTS "Users can view all profile photos" ON public.profile_photos;

CREATE POLICY "Authenticated users can view profile photos"
  ON public.profile_photos
  FOR SELECT
  TO authenticated
  USING (true);

-- Secure user_interests table
DROP POLICY IF EXISTS "Users can view all user interests" ON public.user_interests;

CREATE POLICY "Authenticated users can view user interests"
  ON public.user_interests
  FOR SELECT
  TO authenticated
  USING (true);