-- Create privacy_settings table for user privacy preferences
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  show_exact_location BOOLEAN NOT NULL DEFAULT false,
  show_distance BOOLEAN NOT NULL DEFAULT true,
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  show_last_active BOOLEAN NOT NULL DEFAULT true,
  show_profile_in_discovery BOOLEAN NOT NULL DEFAULT true,
  allow_profile_indexing BOOLEAN NOT NULL DEFAULT false,
  share_activity_with_matches BOOLEAN NOT NULL DEFAULT true,
  share_interests_publicly BOOLEAN NOT NULL DEFAULT true,
  location_fuzzing_radius_miles NUMERIC NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own privacy settings
CREATE POLICY "Users can view own privacy settings"
ON public.privacy_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own privacy settings
CREATE POLICY "Users can insert own privacy settings"
ON public.privacy_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own privacy settings
CREATE POLICY "Users can update own privacy settings"
ON public.privacy_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_privacy_settings_updated_at
BEFORE UPDATE ON public.privacy_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create function to initialize privacy settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_privacy_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

-- Trigger to auto-create privacy settings on user signup
CREATE TRIGGER on_auth_user_created_privacy_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_privacy_settings();