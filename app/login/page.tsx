'use client';

import React, { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useMessage } from '@/context/MessageContext';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaId, setRecaptchaId] = useState<number | null>(null);
  const { login } = useAuth();
  const { setMessage, clearMessage } = useMessage();

  // Determine if typed username is Admin
  const isAdminLogin = username.trim().toLowerCase() === 'admin';

  // reCAPTCHA render
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isMounted = true;

    const renderRecaptcha = () => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.render) {
        try {
          const container = document.getElementById('recaptcha-container');
          if (container && container.innerHTML === '') {
            // @ts-ignore
            const id = window.grecaptcha.render('recaptcha-container', {
              sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeUHRAtAAAAAGJFdZSqUAK-N1LuVuExOwEJmQ0T',
            });
            if (isMounted) setRecaptchaId(id);
          }
        } catch (err) {
          console.error('Error rendering reCAPTCHA:', err);
        }
      } else {
        timer = setTimeout(renderRecaptcha, 300);
      }
    };

    renderRecaptcha();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const validateUsername = (value: string): boolean => {
    return typeof value === 'string' && value.trim().length >= 3 && !/\s/.test(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessage();

    if (!validateUsername(username)) {
      setMessage('Please enter a valid username (at least 3 characters, no spaces).', 'error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    // Require company name text input only for normal users
    if (!isAdminLogin && !companyNameInput.trim()) {
      setMessage('Please enter your company name.', 'error');
      return;
    }

    // Extract Google reCAPTCHA v2 token
    // @ts-ignore
    const recaptchaToken = typeof window !== 'undefined' && window.grecaptcha ? window.grecaptcha.getResponse() : '';
    if (!recaptchaToken) {
      setMessage('Please verify that you are not a robot (reCAPTCHA is required).', 'error');
      return;
    }

    setLoading(true);
    clearMessage();

    login(
      username,
      password,
      recaptchaToken,
      undefined, // companyId is omitted when typed directly as a text name
      isAdminLogin ? undefined : companyNameInput.trim()
    )
      .then((data) => {
        setLoading(false);
        setMessage('Login successful.', 'success');
        setUsername('');
        setPassword('');
        setCompanyNameInput('');
        console.log('login returned', data);
        router.push('/');
      })
      .catch((err: Error) => {
        setLoading(false);
        console.error('Login error', err);
        setMessage(err.message || 'Network or server error', 'error');
        // Reset Google reCAPTCHA widget on authentication failure
        // @ts-ignore
        if (typeof window !== 'undefined' && window.grecaptcha) {
          // @ts-ignore
          window.grecaptcha.reset();
        }
      });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Pfapappbar />

      <Box sx={{ flex: 1, pb: 12 }}>
        <Pfapcontainer maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 4,
              p: 3,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography component="h1" variant="h5" sx={{ mb: 1, color: '#00518c' }}>
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use your approved account to access the calendar.
                </Typography>
              </Box>

              <Box sx={{ width: '100%' }}>
                <form onSubmit={handleSubmit} noValidate>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                  />

                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  {/* Company Name Input Text Field (Bypassed if user is Admin) */}
                  <TextField
                    margin="normal"
                    required={!isAdminLogin}
                    fullWidth
                    name="companyName"
                    label="Company Name"
                    id="companyName"
                    disabled={isAdminLogin}
                    value={isAdminLogin ? '' : companyNameInput}
                    onChange={(event) => setCompanyNameInput(event.target.value)}
                  />

                  {isAdminLogin && (
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, display: 'block', mt: 0.5, mb: 1 }}>
                      ✓ Admin login bypassed from company requirement.
                    </Typography>
                  )}

                  {/* Google reCAPTCHA v2 Checkbox Widget Container */}
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <div id="recaptcha-container" />
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                </form>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Need access or want to purchase? <Link href="/register">Go to register</Link>
              </Typography>
            </Stack>
          </Paper>
        </Pfapcontainer>
      </Box>

      <Pfapfooter />
    </Box>
  );
}
