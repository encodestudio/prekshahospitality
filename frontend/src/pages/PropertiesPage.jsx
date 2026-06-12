import React, { useMemo } from 'react';
import { Box, Container, Grid, Typography, Divider } from '@mui/material';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import Layout from '../components/layout/Layout';
import PropertyCard from '../components/properties/PropertyCard';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperties } from '../hooks/useProperty';

export default function PropertiesPage() {
  const { properties, loading, error } = useProperties();

  const cityGroups = useMemo(() => {
    const groups = {};
    properties.forEach((p) => {
      const key = p.city_name || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return groups;
  }, [properties]);

  if (loading) return <LoadingScreen message="Loading properties..." />;

  const cities = Object.keys(cityGroups).sort();

  return (
    <Layout>
      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 55%, #6B3A2A 100%)',
          py: { xs: 10, md: 14 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '"🕉️"',
            position: 'absolute',
            fontSize: '22rem',
            opacity: 0.03,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            userSelect: 'none',
          },
        }}
      >
        <Container maxWidth="md">
          <Typography
            sx={{
              color: '#FF6B35',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              mb: 2,
            }}
          >
            — Our Collection —
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Cinzel", serif',
              color: '#FFD700',
              fontSize: { xs: '2rem', md: '3.5rem' },
              letterSpacing: '0.05em',
              mb: 3,
            }}
          >
            Our Properties
          </Typography>
          <Typography
            sx={{
              color: '#FFD9C0',
              fontSize: { xs: '1rem', md: '1.15rem' },
              maxWidth: 620,
              mx: 'auto',
              lineHeight: 1.85,
            }}
          >
            Each Preksha property is a spiritual sanctuary — thoughtfully crafted to offer
            divine comfort across India's most sacred and serene destinations.
          </Typography>
        </Container>
      </Box>

      {/* City-wise Listing */}
      <Box sx={{ backgroundColor: '#FFF8F0', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          {error ? (
            <Typography color="error" textAlign="center" sx={{ py: 8 }}>
              {error}
            </Typography>
          ) : cities.length === 0 ? (
            <Typography textAlign="center" sx={{ color: '#6B4226', py: 8 }}>
              No properties available at the moment.
            </Typography>
          ) : (
            cities.map((city, index) => (
              <Box key={city} sx={{ mb: index < cities.length - 1 ? 10 : 0 }}>
                {/* City Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 16px rgba(255,107,53,0.3)',
                    }}
                  >
                    <LocationCityIcon sx={{ color: '#fff', fontSize: 24 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: '"Cinzel", serif',
                        color: '#2C1810',
                        fontSize: { xs: '1.4rem', md: '1.9rem' },
                        lineHeight: 1.1,
                      }}
                    >
                      {city}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#FF6B35',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                      }}
                    >
                      {cityGroups[city].length}{' '}
                      {cityGroups[city].length === 1 ? 'Property' : 'Properties'}
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      flex: 1,
                      borderColor: 'rgba(255,107,53,0.25)',
                      borderWidth: 1.5,
                      ml: 1,
                    }}
                  />
                </Box>

                {/* Property Cards */}
                <Grid container spacing={3}>
                  {cityGroups[city].map((property) => (
                    <Grid item xs={12} sm={6} md={4} key={property.id}>
                      <PropertyCard property={property} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}
        </Container>
      </Box>
    </Layout>
  );
}
