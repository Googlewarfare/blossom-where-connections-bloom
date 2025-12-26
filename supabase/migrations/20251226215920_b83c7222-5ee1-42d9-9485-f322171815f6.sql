-- Fix RLS policies for sensitive tables

-- 1. Ensure trusted_contacts is properly restricted to owners only
-- First drop any overly permissive policies
DROP POLICY IF EXISTS "Users can view all trusted contacts" ON public.trusted_contacts;

-- Verify restrictive policies exist (these should already exist but let's be safe)
DROP POLICY IF EXISTS "Users can view their own trusted contacts" ON public.trusted_contacts;
CREATE POLICY "Users can view their own trusted contacts" 
ON public.trusted_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own trusted contacts" ON public.trusted_contacts;
CREATE POLICY "Users can create their own trusted contacts" 
ON public.trusted_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trusted contacts" ON public.trusted_contacts;
CREATE POLICY "Users can update their own trusted contacts" 
ON public.trusted_contacts 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trusted contacts" ON public.trusted_contacts;
CREATE POLICY "Users can delete their own trusted contacts" 
ON public.trusted_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Ensure date_checkins is properly restricted
DROP POLICY IF EXISTS "Users can view all date checkins" ON public.date_checkins;

DROP POLICY IF EXISTS "Users can view their own date checkins" ON public.date_checkins;
CREATE POLICY "Users can view their own date checkins" 
ON public.date_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own date checkins" ON public.date_checkins;
CREATE POLICY "Users can create their own date checkins" 
ON public.date_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own date checkins" ON public.date_checkins;
CREATE POLICY "Users can update their own date checkins" 
ON public.date_checkins 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Restrict reports table - reporters and admins only
DROP POLICY IF EXISTS "Anyone can view reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;

-- Reporters can view their own reports
CREATE POLICY "Reporters can view their submitted reports" 
ON public.reports 
FOR SELECT 
USING (auth.uid() = reporter_id);

-- Admins/moderators can view all reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
CREATE POLICY "Admins can view all reports" 
ON public.reports 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admins can update reports
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports" 
ON public.reports 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 4. Restrict super_likes - only sender and recipient can see
DROP POLICY IF EXISTS "Anyone can view super likes" ON public.super_likes;
DROP POLICY IF EXISTS "Users can view their super likes" ON public.super_likes;

CREATE POLICY "Users can view their sent or received super likes" 
ON public.super_likes 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 5. Add RLS to daily_analytics view (if it's a table)
-- Note: This is a view, so we need to check the underlying table
-- For now, let's create a policy on page_views that restricts analytics

DROP POLICY IF EXISTS "Only admins can view page views" ON public.page_views;
CREATE POLICY "Only admins can view page views" 
ON public.page_views 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));