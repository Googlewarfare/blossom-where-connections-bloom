-- Create function to fuzz location coordinates based on user's privacy settings
CREATE OR REPLACE FUNCTION public.get_fuzzed_location(
  p_user_id uuid,
  p_latitude double precision,
  p_longitude double precision
)
RETURNS TABLE(fuzzed_latitude double precision, fuzzed_longitude double precision)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fuzzing_radius_miles numeric;
  v_show_exact boolean;
  v_radius_km numeric;
  v_random_angle double precision;
  v_random_distance double precision;
  v_delta_lat double precision;
  v_delta_lng double precision;
BEGIN
  -- Get user's privacy settings
  SELECT 
    location_fuzzing_radius_miles,
    show_exact_location
  INTO v_fuzzing_radius_miles, v_show_exact
  FROM privacy_settings
  WHERE user_id = p_user_id;
  
  -- If no privacy settings exist or user allows exact location, return original
  IF v_show_exact IS TRUE OR v_fuzzing_radius_miles IS NULL OR v_fuzzing_radius_miles = 0 THEN
    RETURN QUERY SELECT p_latitude, p_longitude;
    RETURN;
  END IF;
  
  -- Convert miles to km (1 mile = 1.60934 km)
  v_radius_km := v_fuzzing_radius_miles * 1.60934;
  
  -- Generate random angle and distance within the fuzzing radius
  -- Use a seeded random based on user_id for consistency
  v_random_angle := (hashtext(p_user_id::text)::bigint % 360) * (pi() / 180);
  v_random_distance := (v_radius_km / 2) + ((hashtext(p_user_id::text || 'dist')::bigint % 50) / 100.0 * v_radius_km / 2);
  
  -- Calculate lat/lng deltas (approximate: 1 degree lat = 111.32 km)
  v_delta_lat := (v_random_distance / 111.32) * cos(v_random_angle);
  v_delta_lng := (v_random_distance / (111.32 * cos(p_latitude * pi() / 180))) * sin(v_random_angle);
  
  RETURN QUERY SELECT 
    p_latitude + v_delta_lat,
    p_longitude + v_delta_lng;
END;
$$;

-- Create a view that returns profiles with fuzzed locations for discovery
CREATE OR REPLACE VIEW public.profiles_with_fuzzed_location
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.age,
  p.bio,
  p.location,
  p.occupation,
  p.verified,
  p.verification_status,
  p.gender,
  p.relationship_goal,
  p.height_cm,
  p.education,
  p.religion,
  p.smoking,
  p.drinking,
  p.exercise,
  p.lifestyle,
  p.created_at,
  p.updated_at,
  -- Return fuzzed coordinates
  (SELECT fuzzed_latitude FROM public.get_fuzzed_location(p.id, p.latitude, p.longitude)) as latitude,
  (SELECT fuzzed_longitude FROM public.get_fuzzed_location(p.id, p.latitude, p.longitude)) as longitude
FROM public.profiles p;

-- Grant access to authenticated users
GRANT SELECT ON public.profiles_with_fuzzed_location TO authenticated;

-- Add comment
COMMENT ON VIEW public.profiles_with_fuzzed_location IS 'Profiles view with location fuzzing applied based on each user''s privacy settings';
COMMENT ON FUNCTION public.get_fuzzed_location IS 'Returns fuzzed coordinates based on user privacy settings to prevent precise location tracking';