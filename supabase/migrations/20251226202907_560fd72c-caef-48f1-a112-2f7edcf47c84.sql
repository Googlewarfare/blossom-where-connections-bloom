-- Fix rate_limits policy for INSERT (only WITH CHECK allowed)
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

CREATE POLICY "System can insert rate limits" ON public.rate_limits
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update rate limits" ON public.rate_limits
FOR UPDATE
USING (true)
WITH CHECK (true);