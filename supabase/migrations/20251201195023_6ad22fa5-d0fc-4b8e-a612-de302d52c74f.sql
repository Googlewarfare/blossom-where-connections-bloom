-- Create profile_views table
CREATE TABLE public.profile_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id uuid NOT NULL,
  viewed_user_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Users can view who viewed their profile
CREATE POLICY "Users can view who viewed their profile"
ON public.profile_views
FOR SELECT
USING (auth.uid() = viewed_user_id);

-- Users can insert profile views
CREATE POLICY "Users can insert profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Create index for performance
CREATE INDEX idx_profile_views_viewed_user ON public.profile_views(viewed_user_id, viewed_at DESC);
CREATE INDEX idx_profile_views_viewer ON public.profile_views(viewer_id, viewed_at DESC);

-- Create likes table (separate from swipes for clearer tracking)
CREATE TABLE public.profile_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id uuid NOT NULL,
  liked_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(liker_id, liked_user_id)
);

-- Enable RLS on profile_likes
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

-- Users can view who liked them
CREATE POLICY "Users can view who liked them"
ON public.profile_likes
FOR SELECT
USING (auth.uid() = liked_user_id OR auth.uid() = liker_id);

-- Users can insert likes
CREATE POLICY "Users can insert likes"
ON public.profile_likes
FOR INSERT
WITH CHECK (auth.uid() = liker_id);

-- Create index for performance
CREATE INDEX idx_profile_likes_liked_user ON public.profile_likes(liked_user_id, created_at DESC);
CREATE INDEX idx_profile_likes_liker ON public.profile_likes(liker_id, created_at DESC);

-- Enable realtime
ALTER TABLE public.profile_views REPLICA IDENTITY FULL;
ALTER TABLE public.profile_likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_likes;