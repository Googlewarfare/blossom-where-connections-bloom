-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  blocked_by UUID NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Admins and moderators can view blocked users
CREATE POLICY "Admins and moderators can view blocked users"
ON public.blocked_users
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Admins can block users
CREATE POLICY "Admins can block users"
ON public.blocked_users
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Admins can unblock users
CREATE POLICY "Admins can unblock users"
ON public.blocked_users
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Users can check if they are blocked (for app logic)
CREATE POLICY "Users can check own block status"
ON public.blocked_users
FOR SELECT
USING (auth.uid() = user_id);