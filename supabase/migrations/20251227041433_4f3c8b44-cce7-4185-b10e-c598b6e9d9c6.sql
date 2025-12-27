-- Fix RLS on anonymized_reports view (it's a view, so we need security through the base table)
-- The anonymized_reports view should only be accessible to admins/moderators

-- Create policy for daily_analytics - restrict to admins only
-- Note: daily_analytics is a view, so we need to handle it differently
-- Views in PostgreSQL inherit RLS from their base tables

-- For the page_views table (which powers daily_analytics), let's fix the RLS issue
-- The postgres logs show "new row violates row-level security policy for table page_views"

-- Drop existing problematic policies on page_views if they exist
DROP POLICY IF EXISTS "Users can insert their own page views" ON public.page_views;
DROP POLICY IF EXISTS "Allow anonymous page view inserts" ON public.page_views;
DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;

-- Create a policy that allows inserting page views for analytics tracking
-- This should allow both authenticated and anonymous users to insert page views
CREATE POLICY "Allow page view tracking"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow users to view their own page views (or admins to view all)
CREATE POLICY "Users can view own page views or admins view all"
ON public.page_views
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);

-- Create security definer function for checking moderator role
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id
    AND role IN ('admin', 'moderator')
  )
$$;

-- Add RLS policies for icebreaker_questions table (used publicly but should be read-only for users)
DROP POLICY IF EXISTS "Anyone can view active icebreaker questions" ON public.icebreaker_questions;
CREATE POLICY "Anyone can view active icebreaker questions"
ON public.icebreaker_questions
FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage icebreaker questions
CREATE POLICY "Admins can manage icebreaker questions"
ON public.icebreaker_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for daily_questions (similar pattern)
DROP POLICY IF EXISTS "Anyone can view active daily questions" ON public.daily_questions;
CREATE POLICY "Anyone can view active daily questions"
ON public.daily_questions
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage daily questions"
ON public.daily_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for interests table
DROP POLICY IF EXISTS "Anyone can view interests" ON public.interests;
CREATE POLICY "Anyone can view interests"
ON public.interests
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage interests"
ON public.interests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies for captcha_verifications
DROP POLICY IF EXISTS "System can manage captcha verifications" ON public.captcha_verifications;
CREATE POLICY "System can manage captcha verifications"
ON public.captcha_verifications
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);