'use client';

import React, { useState, type FormEvent } from 'react';
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
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setMessage, clearMessage } = useMessage();

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

    setLoading(true);
    clearMessage();

    login(username, password)
      .then((data) => {
        setLoading(false);
        setMessage('Login successful.', 'success');
        setUsername('');
        setPassword('');
        console.log('login returned', data);
        router.push('/');
      })
      .catch((err: Error) => {
        setLoading(false);
        console.error('Login error', err);
        setMessage(err.message || 'Network or server error', 'error');
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
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

