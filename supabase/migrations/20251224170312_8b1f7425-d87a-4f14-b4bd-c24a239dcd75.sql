-- Fix security for daily_analytics VIEW
-- Recreate the view with security_invoker = true so it respects RLS of underlying tables

-- First check if it's the right view and recreate with security invoker
DROP VIEW IF EXISTS public.daily_analytics;

CREATE VIEW public.daily_analytics
WITH (security_invoker = true)
AS
SELECT 
  date(page_views.created_at) AS date,
  COUNT(*) AS page_views,
  COUNT(DISTINCT page_views.session_id) AS unique_sessions,
  COUNT(DISTINCT page_views.user_id) FILTER (WHERE page_views.user_id IS NOT NULL) AS logged_in_users
FROM public.page_views
GROUP BY date(page_views.created_at)
ORDER BY date(page_views.created_at) DESC;

-- Grant access to authenticated users (the underlying page_views table RLS will filter appropriately)
GRANT SELECT ON public.daily_analytics TO authenticated;