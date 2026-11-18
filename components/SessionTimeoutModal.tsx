'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LogoutRoundedIcon from '@mui/icons-material/Lock';
import RefreshRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import { WARNING_THRESHOLD_MS } from '@/lib/session';

/**************************************************
 * formatTimeLeft()
 * Formats milliseconds into mm:ss string for display
 **************************************************/
function formatTimeLeft(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function SessionTimeoutModal() {
  const { session, logout, extendSession } = useAuth();
  const { setMessage } = useMessage();
  const router = useRouter();
  const pathname = usePathname();

  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [msRemaining, setMsRemaining] = useState(0);

  // Track the timestamp of the last user interaction
  const lastActivityRef = useRef<number>(Date.now());
  // Prevent duplicate logout triggers
  const hasLoggedOutRef = useRef<boolean>(false);

  // Perform a clean logout and notify the user
  const handleAutoLogout = useCallback(() => {
    if (hasLoggedOutRef.current) return;
    hasLoggedOutRef.current = true;
    setIsWarningOpen(false);
    logout();
    setMessage('Your session has expired due to inactivity. Please sign in again.', 'warning');
    if (pathname !== '/login') {
      router.push('/login');
    }
  }, [logout, setMessage, pathname, router]);

  // Handle user clicking "Log Out" explicitly inside the modal
  const handleManualLogout = () => {
    setIsWarningOpen(false);
    logout();
    setMessage('You have been logged out.', 'info');
    if (pathname !== '/login') {
      router.push('/login');
    }
  };

  // Handle user clicking "Stay Logged In" inside the modal
  const handleExtendSession = () => {
    extendSession();
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setMessage('Your session has been extended.', 'success');
  };

  // Activity tracking: if user interacts while warning modal is NOT open, record activity
  useEffect(() => {
    if (!session) return;

    const onUserActivity = () => {
      // Do not auto-extend if warning modal is open - user must click "Stay Logged In"
      if (isWarningOpen) return;

      const now = Date.now();
      lastActivityRef.current = now;

      // If user is active and more than 60 seconds have passed since session start/last extension,
      // and we are not in the warning window, refresh the session
      const msLeft = session.expiresAt - now;
      if (msLeft > WARNING_THRESHOLD_MS && now - (session.expiresAt - 30 * 60 * 1000) > 60 * 1000) {
        extendSession();
      }
    };

    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserActivity));
    };
  }, [session, isWarningOpen, extendSession]);

  // Main countdown & warning interval
  useEffect(() => {
    if (!session) {
      setIsWarningOpen(false);
      hasLoggedOutRef.current = false;
      return;
    }

    hasLoggedOutRef.current = false;

    const interval = setInterval(() => {
      const now = Date.now();
      const msLeft = session.expiresAt - now;

      if (msLeft <= 0) {
        setMsRemaining(0);
        clearInterval(interval);
        handleAutoLogout();
        return;
      }

      setMsRemaining(msLeft);

      if (msLeft <= WARNING_THRESHOLD_MS) {
        setIsWarningOpen(true);
      } else {
        setIsWarningOpen(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, handleAutoLogout]);

  if (!session) {
    return null;
  }

  // Calculate percentage remaining for the linear progress bar (from 100% down to 0%)
  const progressPercent = Math.min(100, Math.max(0, (msRemaining / WARNING_THRESHOLD_MS) * 100));

  return (
    <Dialog
      open={isWarningOpen}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(3px)' },
        },
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            textAlign: 'center',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
          },
        },
      }}
    >
      <DialogTitle sx={{ pt: 2, pb: 1 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#fff3e0',
            color: '#e65100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: '#10233f' }}>
          Session Expiring Soon
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You have been inactive. For your security, your session will automatically log out in:
        </Typography>

        <Box
          sx={{
            py: 1.5,
            px: 2,
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: 'monospace',
              color: msRemaining < 30000 ? '#d32f2f' : '#00518c',
              letterSpacing: 2,
            }}
          >
            {formatTimeLeft(msRemaining)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            minutes : seconds
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={progressPercent}
          color={msRemaining < 30000 ? 'error' : 'primary'}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<RefreshRoundedIcon />}
          onClick={handleExtendSession}
          sx={{
            bgcolor: '#00518c',
            py: 1.2,
            fontWeight: 700,
            '&:hover': { bgcolor: '#003e6b' },
          }}
        >
          Stay Signed In
        </Button>
        <Button
          fullWidth
          variant="text"
          size="medium"
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          onClick={handleManualLogout}
          sx={{ color: '#64748b', fontWeight: 600 }}
        >
          Log Out Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
