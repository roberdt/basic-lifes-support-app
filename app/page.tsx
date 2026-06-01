'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import Pfapappbar from '@/components/pfapappbar';
import Pfapcontainer from '@/components/pfapcontainer';
import Pfapfooter from '@/components/pfapfooter';

export default function HomePage() {
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('NEXT_PUBLIC_API_BASE =', process.env.NEXT_PUBLIC_API_BASE);
    }
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Pfapappbar />
      <Pfapcontainer>
        <Typography variant="h4" component="h1" sx={{ mb: 2, color: '#00518c' }}>
          Welcome to BLS (Basic Life Support) Training Scheduler
        </Typography>
        <Box
          sx={{
            p: 3,
            backgroundColor: '#ffffff',
            border: '2px solid #00518c',
            borderRadius: '8px',
            mb: 2,
          }}
        >
          <Typography variant="body1" sx={{ color: '#00518c', fontWeight: 'bold' }}>
            !!!!!UNDER CONSTRUCTION!!!!!
          </Typography>
          <Typography variant="body1" sx={{ color: '#00518c', mt: 1 }}>
            BLS scheduler will be up in no time....
          </Typography>
        </Box>
      </Pfapcontainer>
      <Pfapfooter />
    </Box>
  );
}

