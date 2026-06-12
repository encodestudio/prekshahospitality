import React from 'react';
import {
  Box, Container, Grid, Typography, IconButton,
  Divider, Link as MuiLink, Stack,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';

export default function Footer({ property }) {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(180deg, #4A1A00 0%, #6B2800 50%, #4A1A00 100%)',
        color: '#FFE8CC',
        pt: 8,
        pb: 3,
        borderTop: '4px solid #FF6B35',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={5}>
          {/* Brand Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <img
                src="/logo-reference-no-background.png"
                alt="Preksha Hospitality"
                style={{ height: 96, width: 'auto', display: 'block' }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,232,204,0.85)', lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}
            >
              {property?.short_description || 'Where Every Stay is Divine. Experience the sacred tranquility of our retreats, blending spiritual heritage with modern comforts.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {[
                { icon: <FacebookIcon />, label: 'Facebook' },
                { icon: <InstagramIcon />, label: 'Instagram' },
                { icon: <YouTubeIcon />, label: 'YouTube' },
                { icon: <WhatsAppIcon />, label: 'WhatsApp', href: property?.whatsapp_number ? `https://wa.me/${property.whatsapp_number}` : '#' },
              ].map((social) => (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    color: '#FFE8CC',
                    border: '1px solid rgba(255,215,0,0.3)',
                    '&:hover': {
                      color: '#FFD700',
                      border: '1px solid #FFD700',
                      backgroundColor: 'rgba(255,215,0,0.12)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="overline"
              sx={{ color: '#FF6B35', letterSpacing: '0.15em', fontWeight: 700, display: 'block', mb: 2 }}
            >
              Quick Links
            </Typography>
            {[
              { label: 'Home', to: '/' },
              { label: 'Rooms & Suites', to: '/rooms' },
              { label: 'Amenities', to: '/amenities' },
              { label: 'Gallery', to: '/gallery' },
              { label: 'About Us', to: '/about' },
              { label: 'Contact', to: '/contact' },
            ].map((link) => (
              <MuiLink
                key={link.to}
                component={Link}
                to={link.to}
                sx={{
                  display: 'block',
                  color: 'rgba(255,232,204,0.85)',
                  textDecoration: 'none',
                  mb: 1,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFD700', pl: 0.5 },
                  transition: 'all 0.2s ease',
                }}
              >
                › {link.label}
              </MuiLink>
            ))}
          </Grid>

          {/* Policies */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography
              variant="overline"
              sx={{ color: '#FF6B35', letterSpacing: '0.15em', fontWeight: 700, display: 'block', mb: 2 }}
            >
              Policies
            </Typography>
            {[
              'Booking Policy',
              'Cancellation Policy',
              'Check-in / Check-out',
              'Privacy Policy',
              'Terms of Service',
            ].map((item) => (
              <MuiLink
                key={item}
                href="#"
                sx={{
                  display: 'block',
                  color: 'rgba(255,232,204,0.85)',
                  textDecoration: 'none',
                  mb: 1,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FFD700', pl: 0.5 },
                  transition: 'all 0.2s ease',
                }}
              >
                › {item}
              </MuiLink>
            ))}
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="overline"
              sx={{ color: '#FF6B35', letterSpacing: '0.15em', fontWeight: 700, display: 'block', mb: 2 }}
            >
              Contact Us
            </Typography>
            <Stack spacing={2}>
              {property?.address && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <LocationOnIcon sx={{ color: '#FF6B35', fontSize: 20, mt: 0.3, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,232,204,0.88)', lineHeight: 1.7 }}>
                    {property.address}
                  </Typography>
                </Box>
              )}
              {property?.phone && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
                  <MuiLink
                    href={`tel:${property.phone}`}
                    sx={{ color: 'rgba(255,232,204,0.88)', textDecoration: 'none', '&:hover': { color: '#FFD700' } }}
                  >
                    {property.phone}
                  </MuiLink>
                </Box>
              )}
              {property?.whatsapp_number && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <WhatsAppIcon sx={{ color: '#25D366', fontSize: 18 }} />
                  <MuiLink
                    href={`https://wa.me/${property.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'rgba(255,232,204,0.88)', textDecoration: 'none', '&:hover': { color: '#25D366' } }}
                  >
                    {property.whatsapp_number}
                  </MuiLink>
                </Box>
              )}
              {property?.email && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <EmailIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
                  <MuiLink
                    href={`mailto:${property.email}`}
                    sx={{ color: 'rgba(255,232,204,0.88)', textDecoration: 'none', '&:hover': { color: '#FFD700' } }}
                  >
                    {property.email}
                  </MuiLink>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,215,0,0.25)' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,232,204,0.6)', textAlign: 'center' }}>
            © {currentYear} Preksha Hospitality. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,232,204,0.55)', textAlign: 'center' }}>
            🕉️ &nbsp; सर्वे भवन्तु सुखिनः &nbsp; 🕉️
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
