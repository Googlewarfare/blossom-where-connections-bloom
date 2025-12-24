-- Create audit logging table for sensitive admin actions
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS - only admins can view audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Create failed login attempts table for account lockout
CREATE TABLE public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Only system can insert login attempts (via edge function)
CREATE POLICY "System can insert login attempts"
ON public.login_attempts FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Admins can view login attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Create index for faster lockout checks
CREATE INDEX idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX idx_login_attempts_created_at ON public.login_attempts(created_at DESC);

-- Create rate limiting table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- user_id or IP address
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits"
ON public.rate_limits FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- Create composite index for rate limit lookups
CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_endpoint text,
  p_max_requests integer DEFAULT 100,
  p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_current_count integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;
  
  -- Get current request count in window
  SELECT COALESCE(SUM(request_count), 0) INTO v_current_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start > v_window_start;
  
  -- If over limit, return false
  IF v_current_count >= p_max_requests THEN
    RETURN false;
  END IF;
  
  -- Insert new request record
  INSERT INTO rate_limits (identifier, endpoint, window_start)
  VALUES (p_identifier, p_endpoint, now());
  
  -- Clean up old records (older than 1 hour)
  DELETE FROM rate_limits WHERE window_start < now() - interval '1 hour';
  
  RETURN true;
END;
$$;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(
  p_email text,
  p_max_attempts integer DEFAULT 5,
  p_lockout_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_count integer;
  v_window_start timestamptz;
BEGIN
  v_window_start := now() - (p_lockout_minutes || ' minutes')::interval;
  
  -- Count failed attempts in lockout window
  SELECT COUNT(*) INTO v_failed_count
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > v_window_start;
  
  -- Return true if account is locked
  RETURN v_failed_count >= p_max_attempts;
END;
$$;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email text,
  p_ip_address text DEFAULT NULL,
  p_success boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success)
  VALUES (p_email, p_ip_address, p_success);
  
  -- Clean up old records (older than 24 hours)
  DELETE FROM login_attempts WHERE created_at < now() - interval '24 hours';
END;
$$;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id uuid DEFAULT NULL,
  p_old_data jsonb DEFAULT NULL,
  p_new_data jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_table_name, p_record_id, p_old_data, p_new_data, p_ip_address, p_user_agent);
END;
$$;