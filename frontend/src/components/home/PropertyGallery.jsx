import React, { useState } from 'react';
import { Box, Container, Grid, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SectionHeading from '../common/SectionHeading';

const TILE_SX = {
  height: '100%',
  width: '100%',
  borderRadius: 3,
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  '& img': { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' },
  '&:hover img': { transform: 'scale(1.06)' },
};

export default function PropertyGallery({ property }) {
  const photos = property?.photos || [];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) return null;

  const openAt = (i) => { setIndex(i); setOpen(true); };
  const prev = () => setIndex((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIndex((i) => (i + 1) % photos.length);

  const displayPhotos = photos.slice(0, 5);
  const remaining = photos.length - displayPhotos.length;

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFF8F0' }}>
      <Container maxWidth="lg">
        <SectionHeading
          preTitle="Take a Look Inside"
          title="Property Gallery"
          subtitle="A closer look at the spaces, surroundings, and sacred ambience that await you."
        />

        <Grid container spacing={1.5} sx={{ height: { xs: 'auto', md: 420 } }}>
          <Grid item xs={12} md={6} sx={{ height: { xs: 260, md: '100%' } }}>
            <Box onClick={() => openAt(0)} sx={TILE_SX}>
              <img src={displayPhotos[0].photo} alt={displayPhotos[0].caption || property.name} />
            </Box>
          </Grid>

          {displayPhotos.length > 1 && (
            <Grid item xs={12} md={6}>
              <Grid container spacing={1.5}>
                {displayPhotos.slice(1, 5).map((photo, i) => (
                  <Grid item xs={6} key={photo.id} sx={{ height: { xs: 125, md: 204 } }}>
                    <Box onClick={() => openAt(i + 1)} sx={TILE_SX}>
                      <img src={photo.photo} alt={photo.caption || property.name} />
                      {i === 3 && remaining > 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(44,24,16,0.55)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography sx={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>
                            +{remaining} more
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Lightbox */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#000', boxShadow: 'none' } }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 300, md: 560 },
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>
          {photos.length > 1 && (
            <IconButton onClick={prev} sx={{ position: 'absolute', left: 8, color: '#fff', zIndex: 2 }}>
              <ArrowBackIosNewIcon />
            </IconButton>
          )}
          <Box
            component="img"
            src={photos[index]?.photo}
            alt={photos[index]?.caption || property.name}
            sx={{ maxWidth: '100%', maxHeight: { xs: 400, md: 640 }, objectFit: 'contain' }}
          />
          {photos.length > 1 && (
            <IconButton onClick={next} sx={{ position: 'absolute', right: 8, color: '#fff', zIndex: 2 }}>
              <ArrowForwardIosIcon />
            </IconButton>
          )}
        </Box>
        {photos[index]?.caption && (
          <Typography sx={{ color: '#fff', textAlign: 'center', py: 1.5, backgroundColor: '#000' }}>
            {photos[index].caption}
          </Typography>
        )}
      </Dialog>
    </Box>
  );
}
