-- Add verification status to profiles
ALTER TABLE public.profiles
ADD COLUMN verified boolean NOT NULL DEFAULT false,
ADD COLUMN verification_photo_url text,
ADD COLUMN verification_status text DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add advanced profile fields
ALTER TABLE public.profiles
ADD COLUMN education text,
ADD COLUMN lifestyle text,
ADD COLUMN relationship_goal text,
ADD COLUMN drinking text,
ADD COLUMN smoking text,
ADD COLUMN exercise text,
ADD COLUMN height_cm integer,
ADD COLUMN religion text;

-- Add advanced preferences
ALTER TABLE public.preferences
ADD COLUMN education_preference text[],
ADD COLUMN lifestyle_preference text[],
ADD COLUMN relationship_goal_preference text[],
ADD COLUMN drinking_preference text[],
ADD COLUMN smoking_preference text[],
ADD COLUMN exercise_preference text[],
ADD COLUMN min_height_cm integer,
ADD COLUMN max_height_cm integer,
ADD COLUMN religion_preference text[];

-- Create icebreaker questions table
CREATE TABLE public.icebreaker_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  category text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on icebreaker_questions
ALTER TABLE public.icebreaker_questions ENABLE ROW LEVEL SECURITY;

-- Anyone can view active icebreaker questions
CREATE POLICY "Anyone can view active icebreaker questions"
ON public.icebreaker_questions
FOR SELECT
USING (is_active = true);

-- Insert default icebreaker questions
INSERT INTO public.icebreaker_questions (question, category) VALUES
('If you could have dinner with anyone, dead or alive, who would it be?', 'fun'),
('What''s the most spontaneous thing you''ve ever done?', 'adventure'),
('What''s your go-to karaoke song?', 'fun'),
('Beach vacation or mountain retreat?', 'lifestyle'),
('Coffee or tea? And how do you take it?', 'lifestyle'),
('What''s a skill you''d love to learn?', 'interests'),
('Early bird or night owl?', 'lifestyle'),
('What''s your favorite way to spend a Sunday?', 'lifestyle'),
('Cats or dogs? (Or neither!)', 'fun'),
('What''s the best concert you''ve ever been to?', 'interests'),
('If you could live anywhere in the world, where would it be?', 'adventure'),
('What''s your hidden talent?', 'fun'),
('Favorite childhood memory?', 'deep'),
('What makes you laugh the most?', 'fun'),
('Cooking together or trying new restaurants?', 'lifestyle'),
('What''s on your bucket list?', 'adventure'),
('Morning workout or evening workout?', 'lifestyle'),
('What''s your comfort food?', 'lifestyle'),
('Netflix series or movie marathon?', 'fun'),
('What''s something you''re passionate about?', 'deep');