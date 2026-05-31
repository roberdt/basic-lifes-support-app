import Head from 'next/head'
import Link from 'next/link'
import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target as HTMLInputElement & { name: keyof LoginForm }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      <Head>
        <title>Login | Basic Life Support</title>
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 460,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            p: 3,
          }}
        >
          <Stack spacing={2} component="form" onSubmit={onSubmit}>
            <Box>
              <Typography variant="h4">Sign in</Typography>
              <Typography color="text.secondary">
                Use your approved account to access the calendar.
              </Typography>
            </Box>

            {submitted ? (
              <Alert severity="info">
                Login backend is not connected yet. This screen is ready for auth integration.
              </Alert>
            ) : null}

            <TextField
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={onChange}
              required
              fullWidth
            />

            <TextField
              name="password"
              type="password"
              label="Password"
              value={form.password}
              onChange={onChange}
              required
              fullWidth
            />

            <Button variant="contained" type="submit" size="large">
              Sign in
            </Button>

            <Typography variant="body2" color="text.secondary">
              Need access? <Link href="/register">Request calendar access</Link>
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </>
  )
}

