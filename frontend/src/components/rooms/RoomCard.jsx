import React, { useState } from 'react';
import {
  Card, CardContent, CardMedia, Box, Typography,
  Button, Chip, Grid, IconButton, MobileStepper,
} from '@mui/material';
import { Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import KingBedIcon from '@mui/icons-material/KingBed';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

export default function RoomCard({ room }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = room.photos || [];
  const primaryPhoto = photos.find((p) => p.is_primary) || photos[0];

  const handleNext = (e) => {
    e.preventDefault();
    setActivePhoto((prev) => Math.min(prev + 1, photos.length - 1));
  };
  const handleBack = (e) => {
    e.preventDefault();
    setActivePhoto((prev) => Math.max(prev - 1, 0));
  };

  const displayPhoto = photos[activePhoto] || primaryPhoto;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #FFD9C0',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 48px rgba(44,24,16,0.18)',
        },
      }}
    >
      {/* Image with stepper */}
      <Box sx={{ position: 'relative' }}>
        {displayPhoto ? (
          <CardMedia
            component="img"
            height="240"
            image={displayPhoto.photo}
            alt={room.name}
            sx={{ objectFit: 'cover' }}
          />
        ) : (
          <Box
            sx={{
              height: 240,
              background: 'linear-gradient(135deg, #FFF3E0, #FFD9C0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
            }}
          >
            🛏️
          </Box>
        )}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <IconButton
              size="small"
              onClick={handleBack}
              disabled={activePhoto === 0}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(44,24,16,0.6)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(44,24,16,0.8)' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={activePhoto === photos.length - 1}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(44,24,16,0.6)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(44,24,16,0.8)' },
                '&.Mui-disabled': { opacity: 0.3 },
              }}
            >
              <KeyboardArrowRight />
            </IconButton>
            <MobileStepper
              steps={photos.length}
              position="static"
              activeStep={activePhoto}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(44,24,16,0.5)',
                '& .MuiMobileStepper-dot': { backgroundColor: 'rgba(255,255,255,0.4)' },
                '& .MuiMobileStepper-dotActive': { backgroundColor: '#FFD700' },
              }}
              nextButton={<Box />}
              backButton={<Box />}
            />
          </>
        )}

        {/* Price badge */}
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
            <CurrencyRupeeIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>
              {Number(room.price_per_night).toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.6rem', textAlign: 'center', opacity: 0.9 }}>per night</Typography>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Playfair Display", serif',
            color: '#2C1810',
            mb: 1.5,
            fontSize: '1.15rem',
          }}
        >
          {room.name}
        </Typography>

        <Typography variant="body2" sx={{ color: '#6B4226', mb: 2, lineHeight: 1.7 }}>
          {room.description}
        </Typography>

        {/* Room specs */}
        <Grid container spacing={1} sx={{ mb: 2.5 }}>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon sx={{ fontSize: 16, color: '#FF6B35' }} />
              <Typography variant="caption" sx={{ color: '#6B4226' }}>
                {room.max_occupancy} Guests
              </Typography>
            </Box>
          </Grid>
          {room.bed_type && (
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <KingBedIcon sx={{ fontSize: 16, color: '#FF6B35' }} />
                <Typography variant="caption" sx={{ color: '#6B4226' }}>
                  {room.bed_type}
                </Typography>
              </Box>
            </Grid>
          )}
          {room.area_sqft && (
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SquareFootIcon sx={{ fontSize: 16, color: '#FF6B35' }} />
                <Typography variant="caption" sx={{ color: '#6B4226' }}>
                  {room.area_sqft} sq.ft
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        <Button
          component={Link}
          to={`/booking?room=${room.id}${room.property_id ? `&property=${room.property_id}` : ''}`}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 'auto' }}
        >
          Book This Room
        </Button>
      </CardContent>
    </Card>
  );
}
