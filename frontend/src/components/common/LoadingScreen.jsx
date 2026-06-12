import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: '2.5rem' }}>🕉️</Typography>
      <CircularProgress sx={{ color: '#FF6B35' }} />
      <Typography variant="body2" sx={{ color: '#6B4226' }}>{message}</Typography>
    </Box>
  );
}
