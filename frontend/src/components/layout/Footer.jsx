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

export default function Footer({ property }) {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: '#FBF3E7',
        color: '#2C1810',
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
              sx={{ color: '#6B4226', lineHeight: 1.8, mb: 3, fontStyle: 'italic' }}
            >
              {property?.short_description || 'Where Every Stay is Divine. Experience the sacred tranquility of our retreats, blending spiritual heritage with modern comforts.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {[
                { icon: <FacebookIcon />, label: 'Facebook', href: 'https://www.facebook.com/prekshahospitality/' },
                { icon: <InstagramIcon />, label: 'Instagram', href: 'https://www.instagram.com/preksha.hospitality/' },
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
                    color: '#6B4226',
                    border: '1px solid rgba(255,107,53,0.35)',
                    '&:hover': {
                      color: '#FF6B35',
                      border: '1px solid #FF6B35',
                      backgroundColor: 'rgba(255,107,53,0.1)',
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
                  color: '#6B4226',
                  textDecoration: 'none',
                  mb: 1,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FF6B35', pl: 0.5 },
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
                  color: '#6B4226',
                  textDecoration: 'none',
                  mb: 1,
                  fontSize: '0.9rem',
                  '&:hover': { color: '#FF6B35', pl: 0.5 },
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
                  <Typography variant="body2" sx={{ color: '#6B4226', lineHeight: 1.7 }}>
                    {property.address}
                  </Typography>
                </Box>
              )}
              {property?.phones?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <PhoneIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
                  <Typography variant="body2" sx={{ color: '#6B4226' }}>
                    {property.phones.map((p, i) => (
                      <React.Fragment key={p.id}>
                        <MuiLink
                          href={`tel:${p.phone}`}
                          sx={{ color: '#6B4226', textDecoration: 'none', '&:hover': { color: '#FF6B35' } }}
                        >
                          {p.phone}{p.label ? ` (${p.label})` : ''}
                        </MuiLink>
                        {i < property.phones.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                  </Typography>
                </Box>
              )}
              {property?.whatsapp_number && (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <WhatsAppIcon sx={{ color: '#25D366', fontSize: 18 }} />
                  <MuiLink
                    href={`https://wa.me/${property.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: '#6B4226', textDecoration: 'none', '&:hover': { color: '#25D366' } }}
                  >
                    {property.whatsapp_number}
                  </MuiLink>
                </Box>
              )}
              {(property?.emails || []).map((e) => (
                <Box key={`email-${e.id}`} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                  <EmailIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
                  <MuiLink
                    href={`mailto:${e.email}`}
                    sx={{ color: '#6B4226', textDecoration: 'none', '&:hover': { color: '#FF6B35' } }}
                  >
                    {e.email}{e.label ? ` (${e.label})` : ''}
                  </MuiLink>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#FFD9C0' }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: '#8A6952', textAlign: 'center' }}>
            © {currentYear} Preksha Hospitality. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: '#8A6952', textAlign: 'center' }}>
            श्री रामाय नमः
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
