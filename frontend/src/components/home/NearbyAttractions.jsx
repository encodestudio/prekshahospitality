import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Card, CardMedia, Typography, Chip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import SectionHeading from '../common/SectionHeading';
import { citiesApi } from '../../services/api';

export default function NearbyAttractions({ property }) {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    if (!property?.city_id) return;
    citiesApi.get(property.city_id)
      .then((res) => setPlaces(res.data.places || []))
      .catch(() => {});
  }, [property?.city_id]);

  if (places.length === 0) return null;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFFDF5' }}>
      <Container maxWidth="lg">
        <SectionHeading
          preTitle="Explore The Area"
          title="Nearby Attractions"
          subtitle={`Sacred sites and landmarks close to ${property.name}, all within a short drive.`}
        />
        <Grid container spacing={3}>
          {places.map((place) => (
            <Grid item xs={12} sm={6} md={4} key={place.id}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid #FFD9C0',
                  boxShadow: '0 8px 28px rgba(44,24,16,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 14px 36px rgba(44,24,16,0.16)',
                  },
                }}
              >
                {place.photo ? (
                  <CardMedia
                    component="img"
                    height="170"
                    image={place.photo}
                    alt={place.name}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 130,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #FFF3E0, #FFE0C2)',
                    }}
                  >
                    <PlaceIcon sx={{ color: '#FF6B35', fontSize: 40 }} />
                  </Box>
                )}
                <Box sx={{ p: 2.25 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: '#2C1810', fontFamily: '"Playfair Display", serif', fontSize: '1.05rem', mb: place.distance ? 0.75 : place.description ? 1 : 0 }}
                  >
                    {place.name}
                  </Typography>
                  {place.distance && (
                    <Chip
                      icon={<DirectionsCarFilledIcon sx={{ fontSize: '14px !important' }} />}
                      label={place.distance}
                      size="small"
                      sx={{
                        mb: place.description ? 1 : 0,
                        backgroundColor: '#FFF3E0',
                        color: '#B8460A',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 24,
                      }}
                    />
                  )}
                  {place.description && (
                    <Typography variant="body2" sx={{ color: '#6B4226', lineHeight: 1.7 }}>
                      {place.description}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
