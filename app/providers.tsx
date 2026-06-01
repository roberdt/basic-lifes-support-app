'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { MessageProvider } from '@/context/MessageContext';
import theme from '@/theme';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MessageProvider>{children}</MessageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

