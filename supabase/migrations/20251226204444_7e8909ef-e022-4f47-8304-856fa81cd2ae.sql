-- Fix remaining critical RLS issues

-- 1. call_signals - participants only
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view call signals" ON public.call_signals;
DROP POLICY IF EXISTS "Users can insert call signals" ON public.call_signals;

CREATE POLICY "Call participants can view signals" ON public.call_signals
FOR SELECT TO authenticated
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Call participants can insert signals" ON public.call_signals
FOR INSERT TO authenticated
WITH CHECK (from_user_id = auth.uid());

-- 2. audit_logs - admin only for SELECT
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view audit logs" ON public.audit_logs;

CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep INSERT policy for the system
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated users can create audit logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Ensure profile verification_photo_url is hidden from non-owners/admins
-- We'll handle this at the application level by not selecting it in queries

-- 4. Ensure trusted_contacts has RLS enabled
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;

-- 5. Ensure date_checkins has RLS enabled  
ALTER TABLE public.date_checkins ENABLE ROW LEVEL SECURITY;

-- 6. Ensure super_likes has RLS enabled
ALTER TABLE public.super_likes ENABLE ROW LEVEL SECURITY;

-- 7. Ensure messages has RLS enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. Ensure reports has RLS enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 9. Ensure preferences has RLS enabled
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- 10. Ensure profiles has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 11. Ensure matches has RLS enabled
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 12. Ensure profile_views has proper INSERT policy
DROP POLICY IF EXISTS "Users can record their own profile views" ON public.profile_views;

CREATE POLICY "Users can insert own profile views" ON public.profile_views
FOR INSERT TO authenticated
WITH CHECK (viewer_id = auth.uid());