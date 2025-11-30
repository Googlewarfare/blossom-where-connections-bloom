-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  bio text,
  age integer,
  gender text,
  location text,
  occupation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create profile_photos table
CREATE TABLE public.profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

-- Profile photos policies
CREATE POLICY "Users can view all profile photos"
  ON public.profile_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own photos"
  ON public.profile_photos FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create interests table
CREATE TABLE public.interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  category text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interests"
  ON public.interests FOR SELECT
  TO authenticated
  USING (true);

-- Create user_interests junction table
CREATE TABLE public.user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  interest_id uuid REFERENCES public.interests(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user interests"
  ON public.user_interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON public.user_interests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create preferences table
CREATE TABLE public.preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_age integer DEFAULT 18,
  max_age integer DEFAULT 99,
  max_distance integer DEFAULT 50,
  interested_in text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true);

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert some default interests
INSERT INTO public.interests (name, category) VALUES
  ('Travel', 'Lifestyle'),
  ('Hiking', 'Outdoor'),
  ('Cooking', 'Lifestyle'),
  ('Photography', 'Creative'),
  ('Music', 'Creative'),
  ('Fitness', 'Health'),
  ('Yoga', 'Health'),
  ('Reading', 'Lifestyle'),
  ('Movies', 'Entertainment'),
  ('Gaming', 'Entertainment'),
  ('Art', 'Creative'),
  ('Dancing', 'Social'),
  ('Coffee', 'Lifestyle'),
  ('Wine', 'Lifestyle'),
  ('Pets', 'Lifestyle'),
  ('Beach', 'Outdoor'),
  ('Camping', 'Outdoor'),
  ('Sports', 'Active'),
  ('Running', 'Active'),
  ('Cycling', 'Active');