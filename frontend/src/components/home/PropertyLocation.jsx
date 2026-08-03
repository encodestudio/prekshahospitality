import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import SectionHeading from '../common/SectionHeading';

export default function PropertyLocation({ property }) {
  if (!property || !property.address) return null;

  const { latitude, longitude, address, name } = property;
  const hasCoords = latitude != null && longitude != null;
  const query = hasCoords ? `${latitude},${longitude}` : address || name;
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FBF3E7' }}>
      <Container maxWidth="lg">
        <SectionHeading
          preTitle="Find Us"
          title="Location"
          subtitle="Nestled in the heart of a sacred destination, easy to reach and simple to find."
        />
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
              <LocationOnIcon sx={{ color: '#FF6B35', mt: 0.3, flexShrink: 0 }} />
              <Typography variant="body1" sx={{ color: '#4A2C1A', lineHeight: 1.85 }}>
                {address}
              </Typography>
            </Box>
            <Button
              component="a"
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              startIcon={<DirectionsIcon />}
            >
              Get Directions
            </Button>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #FFD9C0',
                height: { xs: 280, md: 340 },
                boxShadow: '0 12px 40px rgba(44,24,16,0.12)',
              }}
            >
              <Box
                component="iframe"
                title={`${name} location map`}
                src={embedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sx={{ width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
