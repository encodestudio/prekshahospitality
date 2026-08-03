import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import PropertyInfo from '../components/home/PropertyInfo';
import AmenitiesSection from '../components/home/AmenitiesSection';
import RoomsSection from '../components/home/RoomsSection';
import BookingBanner from '../components/home/BookingBanner';
import { useProperty } from '../hooks/useProperty';

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { property, loading, error } = useProperty(id);

  if (loading) return null;

  if (error || !property) {
    return (
      <Layout>
        <Box sx={{ py: 20, textAlign: 'center' }}>
          <Typography
            sx={{ fontSize: '4rem', mb: 3 }}
          >
            🏨
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', mb: 2 }}
          >
            Property Not Found
          </Typography>
          <Typography sx={{ color: '#6B4226', mb: 4 }}>
            The property you're looking for doesn't exist or is no longer available.
          </Typography>
          <Button
            component={Link}
            to="/properties"
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
          >
            View All Properties
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout property={property}>
      {/* Breadcrumb strip */}
      <Box
        sx={{
          background: 'linear-gradient(90deg, #2C1810, #3A2015)',
          py: 1.25,
          borderBottom: '1px solid rgba(255,215,0,0.12)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              component={Link}
              to="/properties"
              startIcon={<ArrowBackIcon sx={{ fontSize: '0.85rem !important' }} />}
              sx={{
                color: '#FFD9C0',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                minWidth: 0,
                px: 1,
                py: 0.25,
                '&:hover': { color: '#FFD700', backgroundColor: 'transparent' },
              }}
            >
              All Properties
            </Button>
            <Typography sx={{ color: 'rgba(255,215,0,0.35)', fontSize: '0.78rem' }}>/</Typography>
            <Typography
              sx={{
                color: '#FFD700',
                fontSize: '0.78rem',
                letterSpacing: '0.04em',
                fontWeight: 600,
                ml: 0.5,
              }}
            >
              {property.name}
            </Typography>
          </Box>
        </Container>
      </Box>

      <HeroSection property={property} />
      <PropertyInfo property={property} />
      <AmenitiesSection property={property} />
      <RoomsSection property={property} />
      <BookingBanner property={property} />
    </Layout>
  );
}
