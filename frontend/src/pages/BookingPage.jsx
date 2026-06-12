import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BookingForm from '../components/booking/BookingForm';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const preselectedRoom = searchParams.get('room');
  const preselectedProperty = searchParams.get('property');

  return (
    <Layout>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 100%)',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              color: '#FF6B35',
              fontSize: '0.75rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            🕉️ &nbsp; Begin Your Sacred Journey &nbsp; 🕉️
          </Typography>
          <Typography variant="h2" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
            Booking Request
          </Typography>
        </Container>
      </Box>
      <BookingForm
        propertyId={preselectedProperty ? Number(preselectedProperty) : null}
        preselectedRoomId={preselectedRoom ? Number(preselectedRoom) : null}
      />
    </Layout>
  );
}
