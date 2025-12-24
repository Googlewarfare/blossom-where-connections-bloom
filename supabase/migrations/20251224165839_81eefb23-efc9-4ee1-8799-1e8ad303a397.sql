-- Fix the function search path for security
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
$$ LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public;