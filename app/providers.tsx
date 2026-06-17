'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@/context/AuthContext';
import { MessageProvider } from '@/context/MessageContext';
import theme from '@/theme';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {mounted && <CssBaseline />}
      <AuthProvider>
        <MessageProvider>{children}</MessageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

