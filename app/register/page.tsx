'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMessage } from '@/context/MessageContext';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';
import { register } from '@/services/auth';

type RegisterForm = {
  username: string;
  fullname: string;
  emailAddress: string;
  companyName: string;
  password: string;
  verifyPassword: string;
  purpose: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

type ApiResponse = {
  message?: string;
  errors?: RegisterErrors;
};

const initialForm: RegisterForm = {
  username: '',
  fullname: '',
  emailAddress: '',
  companyName: '',
  password: '',
  verifyPassword: '',
  purpose: '',
};

function validate(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!form.username.trim()) {
    errors.username = 'Username is required.';
  } else if (form.username.trim().toLowerCase() === form.fullname.trim().toLowerCase()) {
    errors.username = 'User Name cannot be the same as your Full Name.';
  }

  if (!form.fullname.trim()) errors.fullname = 'Full name is required.';

  if (!form.emailAddress.trim()) {
    errors.emailAddress = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAddress.trim())) {
    errors.emailAddress = 'Enter a valid email address.';
  }

  if (!form.companyName.trim()) errors.companyName = 'Organization/ Company is required.';

  const password = form.password || '';
  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8 || !/[#$&]/.test(password)) {
    errors.password = 'Password must be 8 characters or greater and contain #, $, or &.';
  }

  const verifyPassword = form.verifyPassword || '';
  if (!verifyPassword) {
    errors.verifyPassword = 'Please verify your password.';
  } else if (password !== verifyPassword) {
    errors.verifyPassword = 'Passwords do not match.';
  }

  if (form.purpose.trim().length < 10) {
    errors.purpose = 'Please provide a short reason (at least 10 characters).';
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { setMessage, clearMessage } = useMessage();

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target as HTMLInputElement & { name: keyof RegisterForm };
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessage();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setMessage(
        nextErrors.fullname ||
          nextErrors.username ||
          nextErrors.emailAddress ||
          nextErrors.companyName ||
          nextErrors.password ||
          nextErrors.verifyPassword ||
          nextErrors.purpose ||
          'Please fix the highlighted fields.',
        'error'
      );
      return;
    }

    setStatus('loading');

    try {
      const payload = await register({
        username: form.username.trim(),
        fullname: form.fullname.trim(),
        emailAddress: form.emailAddress.trim(),
        companyName: form.companyName.trim(),
        password: form.password,
        verifyPassword: form.verifyPassword,
        purpose: form.purpose.trim(),
      });

      setStatus('success');
      setForm(initialForm);
      setErrors({});
      setMessage(payload.message || 'Registration successful. Please allow 2 business days for approval.', 'success');
      router.push('/');
    } catch (err) {
      setStatus('error');
      console.error('Registration error', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setMessage('Failed to connect to the backend server. Please make sure your backend API is running and CORS is enabled.', 'error');
      } else {
        setMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.', 'error');
      }
    }
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
            <Stack spacing={2} component="form" onSubmit={onSubmit}>
              <Box>
                <Typography component="h1" variant="h5" sx={{ mb: 1, color: '#00518c' }}>
                  Request BLS Calendar
                </Typography>
                <Typography color="text.secondary">
                  Submit request for access to a BLS Calendar for your organization.
                </Typography>
              </Box>

              <TextField
                name="fullname"
                label="Full name"
                value={form.fullname}
                onChange={onChange}
                error={Boolean(errors.fullname)}
                helperText={errors.fullname || ''}
                required
                fullWidth
              />

              <TextField
                name="username"
                label="User Name"
                value={form.username}
                onChange={onChange}
                error={Boolean(errors.username)}
                helperText={errors.username || 'Unique login user name.'}
                required
                fullWidth
              />

              <TextField
                name="emailAddress"
                type="email"
                label="Email"
                value={form.emailAddress}
                onChange={onChange}
                error={Boolean(errors.emailAddress)}
                helperText={errors.emailAddress || ''}
                required
                fullWidth
              />

              <TextField
                name="companyName"
                label="Organization/ Company"
                value={form.companyName}
                onChange={onChange}
                error={Boolean(errors.companyName)}
                helperText={errors.companyName || ''}
                required
                fullWidth
              />

              <TextField
                name="password"
                type="password"
                label="Password"
                value={form.password}
                onChange={onChange}
                error={Boolean(errors.password)}
                helperText={errors.password || 'Password must be 8 characters or greater and contain #, $, or &.'}
                required
                fullWidth
              />

              <TextField
                name="verifyPassword"
                type="password"
                label="Verify Password"
                value={form.verifyPassword}
                onChange={onChange}
                error={Boolean(errors.verifyPassword)}
                helperText={errors.verifyPassword || ''}
                required
                fullWidth
              />

              <TextField
                name="purpose"
                label="Why do you need access?"
                value={form.purpose}
                onChange={onChange}
                error={Boolean(errors.purpose)}
                helperText={errors.purpose || 'Include role/use case so admin can approve quickly.'}
                required
                multiline
                minRows={4}
                fullWidth
              />

              <Button
                variant="contained"
                type="submit"
                size="large"
                disabled={status === 'loading'}
                startIcon={
                  status === 'loading' ? <CircularProgress size={18} color="inherit" /> : null
                }
              >
                {status === 'loading' ? 'Registering...' : 'Register'}
              </Button>

              <Typography variant="body2" color="text.secondary">
                Already approved? <Link href="/login">Go to login</Link>
              </Typography>
            </Stack>
          </Paper>
        </Pfapcontainer>
      </Box>

      <Pfapfooter />
    </Box>
  );
}

