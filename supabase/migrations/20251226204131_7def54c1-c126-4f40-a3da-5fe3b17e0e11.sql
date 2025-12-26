-- Fix remaining: Update page_views SELECT policy to admin-only
DROP POLICY IF EXISTS "Only admins can view page views" ON public.page_views;

CREATE POLICY "Only admins can view page views" ON public.page_views
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));