import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface PfapcontainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
}

function Pfapcontainer({ children, maxWidth = 'md', sx }: PfapcontainerProps) {
  return (
    <Container maxWidth={maxWidth}>
      <Box
        sx={{
          mt: 6,
          mb: 12,
          width: '100%',
          position: 'relative',
          ...sx,
        }}
      >
        {children}
      </Box>
    </Container>
  );
}

export default Pfapcontainer;

