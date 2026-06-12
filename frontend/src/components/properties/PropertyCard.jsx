import React from 'react';
import {
  Card, CardContent, CardMedia, Box, Typography, Button, Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

export default function PropertyCard({ property }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #FFD9C0',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 48px rgba(44,24,16,0.18)',
        },
      }}
    >
      {/* Image */}
      <Box sx={{ position: 'relative' }}>
        {property.primary_photo ? (
          <CardMedia
            component="img"
            height="260"
            image={property.primary_photo}
            alt={property.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 260,
              background: 'linear-gradient(135deg, #FFF3E0, #FFD9C0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5rem',
            }}
          >
            🏨
          </Box>
        )}

        {/* City chip */}
        <Chip
          label={property.city_name}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(44,24,16,0.82)',
            color: '#FFD700',
            fontFamily: '"Lato", sans-serif',
            fontSize: '0.68rem',
            letterSpacing: '0.1em',
            fontWeight: 600,
          }}
        />

        {/* Starting price badge */}
        {property.starting_price && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography sx={{ fontSize: '0.62rem', opacity: 0.9 }}>from&nbsp;</Typography>
              <CurrencyRupeeIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1 }}>
                {Number(property.starting_price).toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.6rem', textAlign: 'center', opacity: 0.9 }}>per night</Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: '#2C1810',
            mb: 1,
            fontSize: '1.2rem',
            lineHeight: 1.3,
          }}
        >
          {property.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
          <LocationOnIcon sx={{ fontSize: 15, color: '#FF6B35' }} />
          <Typography variant="caption" sx={{ color: '#6B4226', fontSize: '0.78rem' }}>
            {property.location}, {property.city_name}
          </Typography>
        </Box>

        {property.room_count > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <HotelIcon sx={{ fontSize: 15, color: '#FF6B35' }} />
            <Typography variant="caption" sx={{ color: '#6B4226', fontSize: '0.78rem' }}>
              {property.room_count} Room {property.room_count === 1 ? 'Type' : 'Types'}
            </Typography>
          </Box>
        )}

        {property.short_description && (
          <Typography
            variant="body2"
            sx={{ color: '#6B4226', mb: 2.5, lineHeight: 1.7, flexGrow: 1 }}
          >
            {property.short_description.length > 110
              ? `${property.short_description.substring(0, 110)}…`
              : property.short_description}
          </Typography>
        )}

        <Button
          component={Link}
          to={`/properties/${property.id}`}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Explore Property
        </Button>
      </CardContent>
    </Card>
  );
}
