-- =============================================
-- SECURITY IMPROVEMENTS MIGRATION (Fixed)
-- =============================================

-- 1. FIX TRUSTED CONTACTS RLS - Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can insert their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can update their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can delete their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can view their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can insert their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can update their trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can delete their trusted contacts" ON public.trusted_contacts;

CREATE POLICY "Owner can view trusted contacts"
ON public.trusted_contacts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert trusted contacts"
ON public.trusted_contacts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update trusted contacts"
ON public.trusted_contacts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete trusted contacts"
ON public.trusted_contacts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. FIX DATE CHECKINS RLS
DROP POLICY IF EXISTS "Users can view their date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can view their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can insert their date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can insert their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can update their date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can update their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can delete their date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can delete their own date checkins" ON public.date_checkins;

CREATE POLICY "Owner can view date checkins"
ON public.date_checkins FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert date checkins"
ON public.date_checkins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update date checkins"
ON public.date_checkins FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete date checkins"
ON public.date_checkins FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 3. SECURE ANALYTICS TABLES
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;
DROP POLICY IF EXISTS "Admins can view all page views" ON public.page_views;
DROP POLICY IF EXISTS "Authenticated users can insert own page views" ON public.page_views;

CREATE POLICY "Admin view page views"
ON public.page_views FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth insert page views"
ON public.page_views FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Fix login_attempts policies
DROP POLICY IF EXISTS "System can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can view own login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Admins can view all login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Authenticated can insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Service role can insert login attempts" ON public.login_attempts;

CREATE POLICY "Admin view login attempts"
ON public.login_attempts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth insert login attempts"
ON public.login_attempts FOR INSERT
TO authenticated
WITH CHECK (true);

-- Fix rate_limits policies
DROP POLICY IF EXISTS "Anyone can check rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Anyone can update rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Authenticated can manage own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

CREATE POLICY "Admin view rate limits"
ON public.rate_limits FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Auth manage own rate limits"
ON public.rate_limits FOR ALL
TO authenticated
USING (identifier = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (identifier = auth.uid()::text OR public.has_role(auth.uid(), 'admin'));

-- 4. ANONYMIZE REPORTS
DROP POLICY IF EXISTS "Reporters can view their submitted reports" ON public.reports;
DROP POLICY IF EXISTS "Admins and moderators can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins and moderators can update reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own submitted reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Users can submit reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

CREATE POLICY "Reporter view own reports"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

CREATE POLICY "Admin view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

CREATE POLICY "User submit reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admin update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- Create anonymized reports view for admins
DROP VIEW IF EXISTS public.anonymized_reports;
CREATE VIEW public.anonymized_reports AS
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

-- 5. CAPTCHA VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS public.captcha_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  action TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '5 minutes')
);

ALTER TABLE public.captcha_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages captcha" ON public.captcha_verifications;

CREATE INDEX IF NOT EXISTS idx_captcha_token_hash ON public.captcha_verifications(token_hash);
CREATE INDEX IF NOT EXISTS idx_captcha_expires ON public.captcha_verifications(expires_at);

CREATE OR REPLACE FUNCTION public.cleanup_expired_captcha()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.captcha_verifications WHERE expires_at < now();
$$;