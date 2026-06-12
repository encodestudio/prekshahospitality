import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, property }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header property={property} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer property={property} />
    </Box>
  );
}
