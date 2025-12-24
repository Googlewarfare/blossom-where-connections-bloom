import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider = ({ children }: SessionTimeoutProviderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  const extendSession = () => {
    resetTimer();
    setShowWarning(false);
  };

  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (debounceTimer) return;
      
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        resetTimer();
      }, 1000);
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [user, resetTimer]);

  useEffect(() => {
    if (!user) return;

    const checkTimeout = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      
      if (elapsed >= SESSION_TIMEOUT) {
        handleLogout();
      } else if (elapsed >= SESSION_TIMEOUT - WARNING_TIME && !showWarning) {
        setShowWarning(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkTimeout);
  }, [user, lastActivity, showWarning, handleLogout]);

  return (
    <>
      {children}
      
      <AlertDialog open={showWarning && !!user} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
            <AlertDialogDescription>
              Your session will expire in 5 minutes due to inactivity. 
              Would you like to stay signed in?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleLogout}>
              Sign Out
            </AlertDialogCancel>
            <AlertDialogAction onClick={extendSession}>
              Stay Signed In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};