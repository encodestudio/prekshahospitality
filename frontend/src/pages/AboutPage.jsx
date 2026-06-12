import React from 'react';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import Layout from '../components/layout/Layout';
import BookingBanner from '../components/home/BookingBanner';
import SectionHeading from '../components/common/SectionHeading';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperty } from '../hooks/useProperty';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

const VALUES = [
  { icon: '🕉️', title: 'Integrity', body: 'We operate with transparency and honesty in every interaction with our guests, partners, and stakeholders.' },
  { icon: '✨', title: 'Quality', body: 'From clean rooms to attentive service, we hold ourselves to high standards so every stay is consistently excellent.' },
  { icon: '🙏', title: 'Service Excellence', body: 'Warm Indian hospitality is at the heart of everything we do — every guest is treated with care and respect.' },
  { icon: '🌿', title: 'Community', body: 'We contribute to local tourism growth and employment generation, creating value beyond our properties.' },
];

export default function AboutPage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);

  if (loading) return <LoadingScreen message="Loading..." />;

  return (
    <Layout property={property}>
      {/* Hero banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 100%)',
          py: { xs: 8, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography
            sx={{ color: '#FF6B35', fontSize: '0.75rem', letterSpacing: '0.4em', textTransform: 'uppercase', mb: 1.5 }}
          >
            🕉️ &nbsp; Our Story &nbsp; 🕉️
          </Typography>
          <Typography variant="h2" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
            About Us
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: 'rgba(255,217,192,0.85)', mt: 2, maxWidth: 520, mx: 'auto' }}
          >
            Committed to delivering comfortable, reliable, and guest-focused experiences across India.
          </Typography>
        </Container>
      </Box>

      {/* Main content */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFF8F0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="flex-start">
            {/* Left: company story */}
            <Grid item xs={12} md={7}>
              <SectionHeading
                preTitle="Who We Are"
                title="Preksha Hospitality Private Limited"
                center={false}
              />

              {[
                'Preksha Hospitality Private Limited is a growing hospitality company committed to delivering comfortable, reliable, and guest-focused accommodation experiences across India\'s emerging tourism and pilgrimage destinations. Incorporated in 2025, the company operates with a vision to create quality hospitality spaces that combine modern convenience with warm Indian hospitality.',
                'At Preksha Hospitality, we believe that every guest deserves a safe, clean, and memorable stay experience. Our focus is on developing and managing hotels, guest houses, homestays, and hospitality properties that cater to families, tourists, pilgrims, business travelers, and group travelers alike.',
                'With the rapid growth of spiritual and cultural tourism in India, particularly in destinations such as Ayodhya and other pilgrimage circuits, Preksha Hospitality aims to build dependable hospitality solutions that meet the evolving expectations of today\'s travelers. We are committed to maintaining high service standards, operational efficiency, and customer satisfaction in every aspect of our business.',
                'Our approach combines professional management, strategic partnerships, and a customer-centric philosophy to create long-term value for guests, travel partners, and stakeholders. Whether it is short-stay accommodation, group bookings, or hospitality management services, our objective is to provide experiences that are comfortable, affordable, and trustworthy.',
                'Driven by integrity, quality, and service excellence, Preksha Hospitality Private Limited continues to explore opportunities in the hospitality sector while contributing to local tourism growth and employment generation.',
              ].map((para, i) => (
                <Typography
                  key={i}
                  variant="body1"
                  sx={{ color: '#4A2C1A', lineHeight: 1.85, mb: 2.5 }}
                >
                  {para}
                </Typography>
              ))}
            </Grid>

            {/* Right: values */}
            <Grid item xs={12} md={5}>
              <Typography
                variant="overline"
                sx={{ color: '#FF6B35', letterSpacing: '0.2em', display: 'block', mb: 3 }}
              >
                Our Core Values
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {VALUES.map((v) => (
                  <Box
                    key={v.title}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid #FFD9C0',
                      backgroundColor: '#FFFDF5',
                    }}
                  >
                    <Typography sx={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0, mt: 0.25 }}>
                      {v.icon}
                    </Typography>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: '#2C1810', fontWeight: 700, fontFamily: '"Playfair Display", serif', mb: 0.5 }}
                      >
                        {v.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B4226', lineHeight: 1.65 }}>
                        {v.body}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: '#FFD9C0' }} />

          {/* Vision & Mission strip */}
          <Grid container spacing={4}>
            {[
              {
                label: 'Our Vision',
                icon: '🌅',
                text: 'To be a trusted name in Indian hospitality, creating quality spaces where every traveler — pilgrim, family, or professional — feels at home.',
              },
              {
                label: 'Our Mission',
                icon: '🎯',
                text: 'To develop and manage hospitality properties that deliver consistent quality, affordable pricing, and warm service across pilgrimage and tourism destinations in India.',
              },
              {
                label: 'Our Focus',
                icon: '📍',
                text: 'Spiritual and cultural tourism destinations — starting with Ayodhya and expanding across India\'s growing pilgrimage circuits.',
              },
            ].map((item) => (
              <Grid item xs={12} md={4} key={item.label}>
                <Box
                  sx={{
                    p: 3.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #FFF3E0, #FFE8CC)',
                    border: '1px solid rgba(255,107,53,0.2)',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '2.2rem', mb: 1.5 }}>{item.icon}</Typography>
                  <Typography
                    variant="overline"
                    sx={{ color: '#FF6B35', letterSpacing: '0.18em', display: 'block', mb: 1 }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4A2C1A', lineHeight: 1.75 }}>
                    {item.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <BookingBanner property={property} />
    </Layout>
  );
}
