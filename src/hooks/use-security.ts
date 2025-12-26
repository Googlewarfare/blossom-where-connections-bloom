import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an account is locked due to too many failed login attempts
 * @param email - The email to check
 * @returns true if account is locked, false otherwise
 */
export const checkAccountLockout = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_account_lockout", {
      p_email: email,
      p_max_attempts: 5,
      p_lockout_minutes: 15,
    });

    if (error) {
      console.error("Error checking account lockout:", error);
      return false; // Fail open to not block legitimate users
    }

    return data === true;
  } catch (error) {
    console.error("Error checking account lockout:", error);
    return false;
  }
};

/**
 * Record a login attempt
 * @param email - The email used for login
 * @param success - Whether the login was successful
 * @param ipAddress - Optional IP address
 */
export const recordLoginAttempt = async (
  email: string,
  success: boolean,
  ipAddress?: string,
): Promise<void> => {
  try {
    await supabase.rpc("record_login_attempt", {
      p_email: email,
      p_success: success,
      p_ip_address: ipAddress || null,
    });
  } catch (error) {
    console.error("Error recording login attempt:", error);
  }
};

/**
 * Check rate limit for an endpoint
 * @param identifier - User ID or IP address
 * @param endpoint - The endpoint being accessed
 * @param maxRequests - Maximum requests allowed in window
 * @param windowSeconds - Time window in seconds
 * @returns true if request is allowed, false if rate limited
 */
export const checkRateLimit = async (
  identifier: string,
  endpoint: string,
  maxRequests: number = 100,
  windowSeconds: number = 60,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("Error checking rate limit:", error);
      return true; // Fail open
    }

    return data === true;
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return true;
  }
};

/**
 * Log an audit event for sensitive actions
 * @param action - The action being performed
 * @param tableName - Optional table name
 * @param recordId - Optional record ID
 * @param oldData - Optional old data (for updates)
 * @param newData - Optional new data (for inserts/updates)
 */
export const logAuditEvent = async (
  action: string,
  tableName?: string,
  recordId?: string,
  oldData?: object,
  newData?: object,
): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.rpc("log_audit_event", {
      p_user_id: user.id,
      p_action: action,
      p_table_name: tableName || null,
      p_record_id: recordId || null,
      p_old_data: oldData ? JSON.stringify(oldData) : null,
      p_new_data: newData ? JSON.stringify(newData) : null,
      p_ip_address: null,
      p_user_agent: navigator.userAgent || null,
    });
  } catch (error) {
    console.error("Error logging audit event:", error);
  }
};

// Session timeout configuration (in milliseconds)
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const SESSION_WARNING = 5 * 60 * 1000; // 5 minutes before timeout

/**
 * Hook for session timeout management
 */
export const useSessionTimeout = (
  onWarning: () => void,
  onTimeout: () => void,
) => {
  let warningTimer: NodeJS.Timeout | null = null;
  let timeoutTimer: NodeJS.Timeout | null = null;
  let lastActivity = Date.now();

  const resetTimers = () => {
    lastActivity = Date.now();

    if (warningTimer) clearTimeout(warningTimer);
    if (timeoutTimer) clearTimeout(timeoutTimer);

    warningTimer = setTimeout(() => {
      onWarning();
    }, SESSION_TIMEOUT - SESSION_WARNING);

    timeoutTimer = setTimeout(() => {
      onTimeout();
    }, SESSION_TIMEOUT);
  };

  const startTracking = () => {
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      if (Date.now() - lastActivity > 1000) {
        // Debounce
        resetTimers();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    resetTimers();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (warningTimer) clearTimeout(warningTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  };

  return { startTracking, resetTimers };
};
