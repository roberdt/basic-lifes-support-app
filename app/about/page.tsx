'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';

export default function AboutPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
      <Pfapappbar />

      <Box sx={{ flex: 1, pb: 12 }}>
        <Pfapcontainer maxWidth="md">
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
              <Typography component="h1" variant="h4" sx={{ color: '#00518c' }}>
                About the BLS Scheduler
              </Typography>
              <Typography color="text.secondary">
                This application helps Basic Life Support teams request access, sign in, and manage a
                monthly training calendar.
              </Typography>
              <Typography color="text.secondary">
                The project now uses Next.js App Router while keeping the existing authentication and
                global messaging contexts in place.
              </Typography>
            </Stack>
          </Paper>
        </Pfapcontainer>
      </Box>

      <Pfapfooter />
    </Box>
  );
}

