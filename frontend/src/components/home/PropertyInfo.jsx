import React from 'react';
import { Box, Container, Grid, Typography, Divider, Stack, Paper } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SectionHeading from '../common/SectionHeading';

export default function PropertyInfo({ property }) {
  if (!property) return null;

  const stats = [
    { icon: '🏨', value: property.room_categories?.length || '10+', label: 'Room Types' },
    { icon: '🌿', value: property.property_amenities?.length || '20+', label: 'Amenities' },
    { icon: '🕉️', value: '5★', label: 'Divine Experience' },
    { icon: '📍', value: property.city_name, label: 'Location' },
  ];

  return (
    <Box id="property-info" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFF8F0' }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          {/* Text content */}
          <Grid item xs={12} md={6}>
            <SectionHeading
              preTitle="About the Property"
              title={property.name}
              center={false}
            />
            <Typography
              variant="body1"
              sx={{ color: '#6B4226', lineHeight: 1.9, mb: 3, whiteSpace: 'pre-line' }}
            >
              {property.description}
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <LocationOnIcon sx={{ color: '#FF6B35', mt: 0.3, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: '#6B4226' }}>
                  {property.address}
                </Typography>
              </Box>
              {property.primary_phone && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#FF6B35', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#6B4226' }}>{property.primary_phone}</Typography>
                </Box>
              )}
              {property.primary_email && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <EmailIcon sx={{ color: '#FF6B35', flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#6B4226' }}>{property.primary_email}</Typography>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Sanskrit quote */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
                borderLeft: '4px solid #FF6B35',
                borderRadius: '0 8px 8px 0',
                p: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontStyle: 'italic',
                  color: '#2C1810',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                }}
              >
                "अतिथि देवो भव" — The Guest is like God
              </Typography>
              <Typography variant="caption" sx={{ color: '#FF6B35', letterSpacing: '0.1em' }}>
                — TAITTIRIYA UPANISHAD
              </Typography>
            </Box>
          </Grid>

          {/* Stats & Image grid */}
          <Grid item xs={12} md={6}>
            {/* Property image */}
            {property.photos?.length > 0 && (
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 4,
                  boxShadow: '0 20px 60px rgba(44,24,16,0.2)',
                  position: 'relative',
                  '&::before': {
                    content: '"🕉️"',
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: '2rem',
                    zIndex: 2,
                    filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
                  },
                }}
              >
                <Box
                  component="img"
                  src={property.photos.find((p) => p.is_primary)?.photo || property.photos[0]?.photo}
                  alt={property.name}
                  sx={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
                />
              </Box>
            )}

            {/* Stats grid */}
            <Grid container spacing={2}>
              {stats.map((stat) => (
                <Grid item xs={6} key={stat.label}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #FFFFFF, #FFF3E0)',
                      border: '1px solid #FFD9C0',
                      borderRadius: 2,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(255,107,53,0.15)',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>{stat.icon}</Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: '"Cinzel", serif', color: '#FF6B35', fontWeight: 700, mb: 0.5 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B4226', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
