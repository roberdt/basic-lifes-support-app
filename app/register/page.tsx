'use client';

import Link from 'next/link';
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

type RegisterForm = {
  fullName: string;
  email: string;
  organization: string;
  reason: string;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

type ApiResponse = {
  message?: string;
  errors?: RegisterErrors;
};

const initialForm: RegisterForm = {
  fullName: '',
  email: '',
  organization: '',
  reason: '',
};

function validate(form: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  if (!form.organization.trim()) errors.organization = 'Organization is required.';
  if (form.reason.trim().length < 10) {
    errors.reason = 'Please provide a short reason (at least 10 characters).';
  }

  return errors;
}

export default function RegisterPage() {
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
        nextErrors.fullName ||
          nextErrors.email ||
          nextErrors.organization ||
          nextErrors.reason ||
          'Please fix the highlighted fields.',
        'error'
      );
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/request-calendar-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload: ApiResponse = await response.json();

      if (!response.ok) {
        setStatus('error');
        setErrors(payload.errors || {});
        setMessage(payload.message || 'Unable to submit request.', 'error');
        return;
      }

      setStatus('success');
      setForm(initialForm);
      setErrors({});
      setMessage(payload.message || 'Request sent successfully.', 'success');
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.', 'error');
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
                name="fullName"
                label="Full name"
                value={form.fullName}
                onChange={onChange}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName || ''}
                required
                fullWidth
              />

              <TextField
                name="email"
                type="email"
                label="Email"
                value={form.email}
                onChange={onChange}
                error={Boolean(errors.email)}
                helperText={errors.email || ''}
                required
                fullWidth
              />

              <TextField
                name="organization"
                label="Organization"
                value={form.organization}
                onChange={onChange}
                error={Boolean(errors.organization)}
                helperText={errors.organization || ''}
                required
                fullWidth
              />

              <TextField
                name="reason"
                label="Why do you need access?"
                value={form.reason}
                onChange={onChange}
                error={Boolean(errors.reason)}
                helperText={errors.reason || 'Include role/use case so admin can approve quickly.'}
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
                {status === 'loading' ? 'Sending request...' : 'Send access request'}
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

