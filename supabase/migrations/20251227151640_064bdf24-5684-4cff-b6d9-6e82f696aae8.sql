-- Set security_invoker = true on all views to use the caller's permissions
ALTER VIEW public.anonymized_reports SET (security_invoker = true);
ALTER VIEW public.daily_analytics SET (security_invoker = true);
ALTER VIEW public.profiles_with_fuzzed_location SET (security_invoker = true);
ALTER VIEW public.discoverable_profiles SET (security_invoker = true);