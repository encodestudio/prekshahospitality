import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

export default function BookingBanner({ property }) {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 40%, #FFD700 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(44,24,16,0.7)', letterSpacing: '0.25em', display: 'block', mb: 1 }}
            >
              Reserve Your Divine Retreat
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: '#2C1810',
                fontFamily: '"Cinzel", serif',
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                mb: 1.5,
              }}
            >
              Begin Your Sacred Journey
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(44,24,16,0.75)', lineHeight: 1.7 }}>
              Submit your booking request and our team will personally confirm your stay, ensuring every detail is perfectly arranged for your divine experience.
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={Link}
                to={property?.id ? `/booking?property=${property.id}` : '/booking'}
                variant="contained"
                size="large"
                startIcon={<EventAvailableIcon />}
                sx={{
                  backgroundColor: '#2C1810',
                  color: '#FFD700',
                  '&:hover': { backgroundColor: '#1A0F08' },
                  boxShadow: '0 8px 24px rgba(44,24,16,0.4)',
                  py: 1.75,
                  fontSize: '1rem',
                }}
              >
                Book Your Stay Now
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {property?.primary_phone && (
                  <Button
                    component="a"
                    href={`tel:${property.primary_phone}`}
                    variant="outlined"
                    startIcon={<PhoneIcon />}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(44,24,16,0.4)',
                      color: '#2C1810',
                      '&:hover': { borderColor: '#2C1810', backgroundColor: 'rgba(44,24,16,0.05)' },
                    }}
                  >
                    Call Us
                  </Button>
                )}
                {property?.whatsapp_number && (
                  <Button
                    component="a"
                    href={`https://wa.me/${property.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    startIcon={<WhatsAppIcon />}
                    fullWidth
                    sx={{
                      backgroundColor: '#25D366',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(18,89,52,0.35)',
                      '&:hover': { backgroundColor: '#1EBE5A' },
                    }}
                  >
                    WhatsApp
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
