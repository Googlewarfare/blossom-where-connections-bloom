-- Add latitude and longitude columns to profiles table for distance calculation
ALTER TABLE public.profiles 
ADD COLUMN latitude NUMERIC(10, 8),
ADD COLUMN longitude NUMERIC(11, 8);

-- Add index for location-based queries
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add distance filter to preferences
ALTER TABLE public.preferences
ADD COLUMN show_profiles_within_miles INTEGER DEFAULT 50;