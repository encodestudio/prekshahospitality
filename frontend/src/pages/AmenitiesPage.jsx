import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Card, CardContent, CardMedia,
  Typography, Chip,
} from '@mui/material';
import Layout from '../components/layout/Layout';
import BookingBanner from '../components/home/BookingBanner';
import SectionHeading from '../components/common/SectionHeading';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperty } from '../hooks/useProperty';
import { propertiesApi } from '../services/api';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

const EMOJI_MAP = {
  'swimming pool': '🏊', 'pool': '🏊', 'spa': '💆', 'wifi': '📶',
  'restaurant': '🍽️', 'gym': '🏋️', 'parking': '🅿️', 'yoga': '🧘',
  'meditation': '🕉️', 'air conditioning': '❄️', 'room service': '🛎️',
  'laundry': '👔', 'garden': '🌿', 'terrace': '🌅', 'bar': '🍹',
  'conference': '💼', 'library': '📚', 'bonfire': '🔥',
  'trekking': '🥾', 'ayurveda': '🌿',
};

function getEmoji(name) {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lower.includes(key)) return emoji;
  }
  return '✨';
}

export default function AmenitiesPage() {
  const { property, loading: propertyLoading } = useProperty(DEFAULT_PROPERTY_ID);
  const [highlighted, setHighlighted] = useState([]);
  const [regular, setRegular] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);

  useEffect(() => {
    propertiesApi
      .list()
      .then((res) => {
        const list = res.data?.results ?? res.data;
        const ids = (Array.isArray(list) ? list : []).map((p) => p.id);
        return Promise.all(ids.map((id) => propertiesApi.get(id)));
      })
      .then((responses) => {
        const seenIds = new Set();
        const h = [];
        const r = [];

        for (const res of responses) {
          for (const pa of res.data.property_amenities || []) {
            if (seenIds.has(pa.amenity.id)) continue;
            seenIds.add(pa.amenity.id);
            if (pa.is_highlighted) {
              h.push(pa.amenity);
            } else {
              r.push(pa.amenity);
            }
          }
        }
        setHighlighted(h);
        setRegular(r);
      })
      .catch(() => {})
      .finally(() => setAmenitiesLoading(false));
  }, []);

  if (propertyLoading || amenitiesLoading) return <LoadingScreen message="Loading amenities..." />;

  return (
    <Layout property={property}>
      {/* Hero banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2C1810 0%, #4A2C1A 60%, #6B3A2A 100%)',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              color: '#FF6B35',
              fontSize: '0.75rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            🕉️ &nbsp; Facilities & Services &nbsp; 🕉️
          </Typography>
          <Typography variant="h2" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif', mb: 2 }}>
            Amenities
          </Typography>
          <Typography variant="body1" sx={{ color: '#FFD9C0', maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
            World-class facilities curated to enhance your stay with comfort, wellness, and spiritual enrichment.
          </Typography>
        </Container>
      </Box>

      {/* Amenities content */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(180deg, #EA580C 0%, #F97316 50%, #EA580C 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.06'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <SectionHeading
            preTitle="Facilities & Services"
            title="Our Amenities"
            subtitle="Thoughtfully curated facilities to ensure your stay is comfortable, rejuvenating, and spiritually enriching."
            light
          />

          {/* Highlighted amenities */}
          {highlighted.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {highlighted.map((amenity) => (
                <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07))',
                      border: '1px solid rgba(255,255,255,0.22)',
                      backdropFilter: 'blur(10px)',
                      transition: 'transform 0.3s ease, border-color 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: 'rgba(255,255,255,0.45)',
                      },
                    }}
                  >
                    {amenity.photo ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={amenity.photo}
                        alt={amenity.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 140,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))',
                          fontSize: '3.5rem',
                        }}
                      >
                        {getEmoji(amenity.name)}
                      </Box>
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {!amenity.photo && (
                          <Typography sx={{ fontSize: '1.2rem' }}>{getEmoji(amenity.name)}</Typography>
                        )}
                        <Typography
                          variant="h6"
                          sx={{ color: '#FFD700', fontFamily: '"Playfair Display", serif', fontSize: '1rem' }}
                        >
                          {amenity.name}
                        </Typography>
                        <Chip
                          label="Featured"
                          size="small"
                          sx={{
                            ml: 'auto',
                            backgroundColor: 'rgba(255,255,255,0.22)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.4)',
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      </Box>
                      {amenity.description && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6 }}>
                          {amenity.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Regular amenities grid */}
          {regular.length > 0 && (
            <Box
              sx={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 3,
                p: { xs: 3, md: 4 },
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: '#fff', letterSpacing: '0.2em', display: 'block', mb: 3, textAlign: 'center' }}
              >
                All Facilities
              </Typography>
              <Grid container spacing={2}>
                {regular.map((amenity) => (
                  <Grid item xs={6} sm={4} md={3} key={amenity.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.14)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.18)',
                          borderColor: 'rgba(255,255,255,0.35)',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: '1.3rem', flexShrink: 0 }}>
                        {getEmoji(amenity.name)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', lineHeight: 1.3 }}
                      >
                        {amenity.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {highlighted.length === 0 && regular.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                No amenities listed yet.
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      <BookingBanner property={property} />
    </Layout>
  );
}
