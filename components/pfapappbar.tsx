'use client';

import React from 'react';
import { Alert, AppBar, Box, Snackbar, Toolbar, Typography } from '@mui/material';
import Pfapmenulist from './nav/pfapmenulist';
import { useMessage } from '@/context/MessageContext';
import { useAuth } from '@/context/AuthContext';


function Pfapappbar() {
  const { message, severity, clearMessage } = useMessage();
  const { userId, companyName } = useAuth();
  const open = Boolean(message && message.length > 0);

  const handleClose = () => {
    clearMessage();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Top Left: Menu bar button & App Title */}
          <Pfapmenulist />
          <Typography variant="h6" color="inherit" sx={{ ml: 1, fontWeight: 600 }}>
            BLS Scheduler
          </Typography>

          {/* Spacer to push right-hand content to the end */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Top Right: User login name and Company (blank if not logged in) */}
          {userId ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
              <Typography variant="subtitle2" color="inherit" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {userId}
              </Typography>
              {companyName ? (
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.85, lineHeight: 1.2 }}>
                  {companyName}
                </Typography>
              ) : null}
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>

      {/* Top snackbar for global messages */}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Pfapappbar;

