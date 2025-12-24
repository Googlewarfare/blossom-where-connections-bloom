-- Add database constraints for profile text fields to enforce validation server-side
-- This provides defense-in-depth for the auth form input validation

-- Add constraints for profiles table text fields
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length CHECK (char_length(full_name) <= 100),
  ADD CONSTRAINT profiles_location_length CHECK (char_length(location) <= 200),
  ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 2000),
  ADD CONSTRAINT profiles_occupation_length CHECK (char_length(occupation) <= 200);

-- Create a validation function for sanitizing text input
CREATE OR REPLACE FUNCTION public.sanitize_profile_text()
RETURNS TRIGGER AS $$
BEGIN
  -- Trim whitespace from text fields
  NEW.full_name := NULLIF(TRIM(NEW.full_name), '');
  NEW.location := NULLIF(TRIM(NEW.location), '');
  NEW.bio := NULLIF(TRIM(NEW.bio), '');
  NEW.occupation := NULLIF(TRIM(NEW.occupation), '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sanitize profile text on insert/update
DROP TRIGGER IF EXISTS sanitize_profile_text_trigger ON public.profiles;
CREATE TRIGGER sanitize_profile_text_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_profile_text();