-- Create super_likes table
CREATE TABLE IF NOT EXISTS public.super_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  stripe_payment_intent_id text,
  UNIQUE(sender_id, recipient_id)
);

-- Enable RLS
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own super likes
CREATE POLICY "Users can insert own super likes"
  ON public.super_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can view super likes they sent
CREATE POLICY "Users can view super likes they sent"
  ON public.super_likes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

-- Users can view super likes they received
CREATE POLICY "Users can view super likes they received"
  ON public.super_likes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id);

-- Enable realtime for super likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.super_likes;