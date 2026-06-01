'use client';

import React from 'react';
import { Alert, AppBar, Box, Snackbar, Toolbar, Typography } from '@mui/material';
import Pfapmenulist from './nav/pfapmenulist';
import { useMessage } from '@/context/MessageContext';
import { useAuth } from '@/context/AuthContext';


function Pfapappbar() {
  const { message, severity, clearMessage } = useMessage();
  const { userId } = useAuth();
  const open = Boolean(message && message.length > 0);

  const handleClose = () => {
    clearMessage();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Pfapmenulist />
          <Typography variant="h6" color="inherit">
            BLS Scheduler
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {userId && (
            <Typography variant="body2" color="inherit">
              Logged In: {userId}
            </Typography>
          )}
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

