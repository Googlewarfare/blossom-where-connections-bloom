-- Fix security definer view by recreating with security_invoker = true
DROP VIEW IF EXISTS public.daily_analytics;

CREATE VIEW public.daily_analytics
WITH (security_invoker = true)
AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as page_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users
FROM public.page_views
GROUP BY DATE(created_at)
ORDER BY date DESC;