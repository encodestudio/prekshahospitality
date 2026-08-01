import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import Layout from '../components/layout/Layout';
import RoomCard from '../components/rooms/RoomCard';
import BookingBanner from '../components/home/BookingBanner';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperty } from '../hooks/useProperty';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

export default function RoomsPage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);

  if (loading) return <LoadingScreen message="Loading rooms..." />;

  const rooms = property?.room_categories?.filter((r) => r.is_active) || [];

  return (
    <Layout property={property}>
      {/* Page Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 60%, #6B3A2A 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '"🛏️"',
            position: 'absolute',
            fontSize: '15rem',
            opacity: 0.05,
            right: '-2rem',
            bottom: '-2rem',
            lineHeight: 1,
          },
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
            🕉️ &nbsp; Our Accommodations &nbsp; 🕉️
          </Typography>
          <Typography
            variant="h2"
            sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif', mb: 2 }}
          >
            Rooms & Suites
          </Typography>
          <Typography variant="body1" sx={{ color: '#FFD9C0', maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
            Each space is a sanctuary — a perfect blend of sacred aesthetics, modern comforts, and divine tranquility.
          </Typography>
        </Container>
      </Box>

      {/* Rooms Grid */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFF8F0' }}>
        <Container maxWidth="lg">
          {rooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography sx={{ fontSize: '3rem', mb: 2 }}>🛏️</Typography>
              <Typography variant="h5" sx={{ color: '#6B4226' }}>Room details coming soon...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rooms.map((room) => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <RoomCard room={room} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <BookingBanner property={property} />
    </Layout>
  );
}
