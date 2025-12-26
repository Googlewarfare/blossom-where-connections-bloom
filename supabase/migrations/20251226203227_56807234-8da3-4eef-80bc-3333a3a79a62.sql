-- Trigger function for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Only log if meaningful fields changed
    IF OLD.full_name IS DISTINCT FROM NEW.full_name
       OR OLD.bio IS DISTINCT FROM NEW.bio
       OR OLD.location IS DISTINCT FROM NEW.location
       OR OLD.occupation IS DISTINCT FROM NEW.occupation
       OR OLD.verification_status IS DISTINCT FROM NEW.verification_status
       OR OLD.verified IS DISTINCT FROM NEW.verified
    THEN
      PERFORM log_audit_event(
        p_user_id := NEW.id,
        p_action := 'profile_update',
        p_table_name := 'profiles',
        p_record_id := NEW.id,
        p_old_data := jsonb_build_object(
          'full_name', OLD.full_name,
          'bio', OLD.bio,
          'location', OLD.location,
          'verification_status', OLD.verification_status
        ),
        p_new_data := jsonb_build_object(
          'full_name', NEW.full_name,
          'bio', NEW.bio,
          'location', NEW.location,
          'verification_status', NEW.verification_status
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function for blocks
CREATE OR REPLACE FUNCTION public.audit_block_actions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      p_user_id := NEW.blocked_by,
      p_action := 'user_blocked',
      p_table_name := 'blocked_users',
      p_record_id := NEW.id,
      p_new_data := jsonb_build_object(
        'blocked_user_id', NEW.user_id,
        'reason', NEW.reason
      )
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      p_user_id := OLD.blocked_by,
      p_action := 'user_unblocked',
      p_table_name := 'blocked_users',
      p_record_id := OLD.id,
      p_old_data := jsonb_build_object(
        'blocked_user_id', OLD.user_id
      )
    );
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function for reports
CREATE OR REPLACE FUNCTION public.audit_report_actions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      p_user_id := COALESCE(NEW.reporter_id, '00000000-0000-0000-0000-000000000000'::uuid),
      p_action := 'report_submitted',
      p_table_name := 'reports',
      p_record_id := NEW.id,
      p_new_data := jsonb_build_object(
        'reported_user_id', NEW.reported_user_id,
        'category', NEW.category,
        'status', NEW.status
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes (admin reviewing reports)
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM log_audit_event(
        p_user_id := COALESCE(NEW.reviewed_by, NEW.reporter_id, '00000000-0000-0000-0000-000000000000'::uuid),
        p_action := 'report_status_changed',
        p_table_name := 'reports',
        p_record_id := NEW.id,
        p_old_data := jsonb_build_object('status', OLD.status),
        p_new_data := jsonb_build_object(
          'status', NEW.status,
          'admin_notes', NEW.admin_notes
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER audit_profiles_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

CREATE TRIGGER audit_blocks_trigger
  AFTER INSERT OR DELETE ON public.blocked_users
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_block_actions();

CREATE TRIGGER audit_reports_trigger
  AFTER INSERT OR UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_report_actions();