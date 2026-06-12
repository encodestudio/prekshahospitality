import React from 'react';
import { Box, Container, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading';
import RoomCard from '../rooms/RoomCard';

export default function RoomsSection({ property }) {
  const rooms = property?.room_categories?.filter((r) => r.is_active) || [];
  if (rooms.length === 0) return null;

  const displayRooms = rooms.slice(0, 3);

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFF8F0' }}>
      <Container maxWidth="lg">
        <SectionHeading
          preTitle="Accommodations"
          title="Rooms & Suites"
          subtitle="Each room is a sanctuary — thoughtfully designed to blend comfort with the sacred aesthetics of our heritage."
        />

        <Grid container spacing={3} sx={{ mb: 5 }}>
          {displayRooms.map((room) => (
            <Grid item xs={12} sm={6} md={4} key={room.id}>
              <RoomCard room={room} />
            </Grid>
          ))}
        </Grid>

        {rooms.length > 3 && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/rooms"
              variant="outlined"
              color="primary"
              size="large"
              sx={{ px: 5 }}
            >
              View All Rooms
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
