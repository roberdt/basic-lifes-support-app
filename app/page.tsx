'use client';

import React from 'react';
import { Box, Typography, Paper, Button, Stack, Avatar } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import Pfapappbar from '@/components/pfapappbar';
import Pfapfooter from '@/components/pfapfooter';
import Pfapcontainer from '@/components/pfapcontainer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box
      sx={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f0f4f8',
      }}
    >
      <Pfapappbar />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: '24px',
          pb: '60px',
          px: 2,
          overflow: 'hidden',
        }}
      >
        <Pfapcontainer maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '24px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 20px 50px rgba(0, 81, 140, 0.12)',
              backgroundColor: '#ffffff',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '6px',
                background: 'linear-gradient(90deg, #00518c 0%, #0284c7 50%, #00518c 100%)',
                borderRadius: '0 0 4px 4px',
              },
            }}
          >
            <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
              {/* Medical/Safety Badge Icon */}
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  backgroundColor: 'rgba(0, 81, 140, 0.08)',
                  color: '#00518c',
                  border: '2px solid rgba(0, 81, 140, 0.2)',
                  boxShadow: '0 4px 16px rgba(0, 81, 140, 0.15)',
                }}
              >
                <HealthAndSafetyIcon sx={{ fontSize: 36 }} />
              </Avatar>

              {/* Element 1: Big Welcome */}
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  fontWeight: 900,
                  color: '#00518c',
                  letterSpacing: '0.03em',
                  fontSize: { xs: '2.75rem', sm: '4rem', md: '5rem' },
                  textTransform: 'uppercase',
                  lineHeight: 1.05,
                  textShadow: '0 2px 10px rgba(0, 81, 140, 0.08)',
                }}
              >
                Welcome
              </Typography>

              {/* Element 2: Big & Italic BLS Scheduler in matching blue */}
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontWeight: 800,
                  fontStyle: 'italic',
                  color: '#00518c',
                  fontSize: { xs: '2rem', sm: '3rem', md: '3.75rem' },
                  borderBottom: '4px solid #00518c',
                  pb: 1.5,
                  px: 3,
                  display: 'inline-block',
                  lineHeight: 1.15,
                }}
              >
                BLS Scheduler
              </Typography>

              {/* Element 3: Created by SafetyNetAccess.org LLC */}
              <Typography
                variant="h5"
                component="p"
                sx={{
                  fontWeight: 600,
                  color: '#334155',
                  backgroundColor: '#f1f5f9',
                  py: 1.25,
                  px: 3.5,
                  borderRadius: '50px',
                  border: '1px solid #e2e8f0',
                  fontSize: { xs: '0.95rem', sm: '1.15rem', md: '1.35rem' },
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                Created by SafetyNetAccess.org LLC
              </Typography>

              {/* Call-to-Action Action Group */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ pt: 1, width: '100%', justifyContent: 'center' }}
              >
                <Button
                  component={Link}
                  href="/about"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    backgroundColor: '#00518c',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.25,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    boxShadow: '0 6px 20px rgba(0, 81, 140, 0.3)',
                    '&:hover': {
                      backgroundColor: '#003c66',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s',
                    },
                  }}
                >
                  View Sample Dashboard (About)
                </Button>

                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{
                    backgroundColor: '#00518c',
                    color: '#ffffff',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.25,
                    borderRadius: '14px',
                    fontSize: '1rem',
                    boxShadow: '0 6px 20px rgba(0, 81, 140, 0.3)',
                    '&:hover': {
                      backgroundColor: '#003c66',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Pfapcontainer>
      </Box>

      <Pfapfooter />
    </Box>
  );
}
