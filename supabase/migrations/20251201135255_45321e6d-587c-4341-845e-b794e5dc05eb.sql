-- Create table for tracking likes and passes
CREATE TABLE public.user_swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('like', 'pass')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Create table for matches (mutual likes)
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (user1_id < user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_swipes
CREATE POLICY "Users can insert own swipes"
  ON public.user_swipes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own swipes"
  ON public.user_swipes
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for matches
CREATE POLICY "Users can view own matches"
  ON public.matches
  FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to check and create matches
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only check if the new swipe is a 'like'
  IF NEW.action_type = 'like' THEN
    -- Check if the target user has also liked this user
    IF EXISTS (
      SELECT 1 FROM user_swipes
      WHERE user_id = NEW.target_user_id
        AND target_user_id = NEW.user_id
        AND action_type = 'like'
    ) THEN
      -- Create a match (ensure user1_id < user2_id)
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.user_id, NEW.target_user_id),
        GREATEST(NEW.user_id, NEW.target_user_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create matches
CREATE TRIGGER on_swipe_check_match
  AFTER INSERT ON public.user_swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_create_match();