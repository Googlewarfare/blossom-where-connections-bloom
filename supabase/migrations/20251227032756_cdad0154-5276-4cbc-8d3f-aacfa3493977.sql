-- Fix security linter issues

-- 1. Fix Security Definer View - convert to Security Invoker
DROP VIEW IF EXISTS public.anonymized_reports;

CREATE VIEW public.anonymized_reports 
WITH (security_invoker = true)
AS
SELECT 
  id,
  reported_user_id,
  category,
  description,
  evidence_urls,
  status,
  admin_notes,
  reviewed_by,
  reviewed_at,
  created_at,
  updated_at,
  encode(sha256(reporter_id::text::bytea), 'hex') as anonymous_reporter_hash
FROM public.reports;

GRANT SELECT ON public.anonymized_reports TO authenticated;

-- 2. Fix RLS Enabled No Policy - add policy for captcha_verifications
-- This table should only be accessible via service role (edge functions)
-- No authenticated user policies needed, but we add an explicit deny-all for clarity
CREATE POLICY "No direct access to captcha"
ON public.captcha_verifications FOR SELECT
TO authenticated
USING (false);