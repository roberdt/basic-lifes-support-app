'use client';

import { Box } from '@mui/material';
import { keyframes } from '@mui/system';
import { useEffect, useState } from 'react';

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
`;

const BouncingBalls = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          width: '18px',
          height: '18px',
          backgroundColor: '#0074C8',
          borderRadius: '100%',
          display: 'inline-block',
          animation: `${bounce} 1.4s infinite ease-in-out both`,
          animationDelay: '-0.32s',
          margin: '0 4px',
        }}
      />
      <Box
        sx={{
          width: '18px',
          height: '18px',
          backgroundColor: '#0074C8',
          borderRadius: '100%',
          display: 'inline-block',
          animation: `${bounce} 1.4s infinite ease-in-out both`,
          animationDelay: '-0.16s',
          margin: '0 4px',
        }}
      />
      <Box
        sx={{
          width: '18px',
          height: '18px',
          backgroundColor: '#0074C8',
          borderRadius: '100%',
          display: 'inline-block',
          animation: `${bounce} 1.4s infinite ease-in-out both`,
          margin: '0 4px',
        }}
      />
    </Box>
  );
};

export default BouncingBalls;