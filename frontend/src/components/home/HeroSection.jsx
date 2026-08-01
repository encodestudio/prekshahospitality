import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Chip, Stack,
  TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton, Grid, Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { propertiesApi, bookingsApi, citiesApi } from '../../services/api';

const formatDate = (d) =>
  d
    ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const BAR_FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    color: '#2C1810',
    backgroundColor: 'rgba(255,253,245,0.55)',
    '& fieldset': { borderColor: 'rgba(255,107,53,0.35)' },
    '&:hover fieldset': { borderColor: '#FF6B35' },
    '&.Mui-focused fieldset': { borderColor: '#E55A25' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(44,24,16,0.62)', fontSize: '0.8rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#E55A25' },
  '& .MuiSvgIcon-root': { color: 'rgba(44,24,16,0.55)' },
  '& input[type="date"]': { colorScheme: 'light' },
};

const DIALOG_FIELD_SX = {
  mb: 2.5,
  '& .MuiOutlinedInput-root': {
    color: '#2C1810',
    '& fieldset': { borderColor: 'rgba(255,107,53,0.32)' },
    '&:hover fieldset': { borderColor: '#FF6B35' },
    '&.Mui-focused fieldset': { borderColor: '#E55A25' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(44,24,16,0.62)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#E55A25' },
  '& .MuiSvgIcon-root': { color: 'rgba(44,24,16,0.55)' },
};

export default function HeroSection({ property }) {
  const [cities, setCities] = useState([]);
  const [cityProperties, setCityProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [bar, setBar] = useState({
    city: '',
    venue: '',
    check_in_date: '',
    check_out_date: '',
    number_of_adults: 2,
    number_of_children: 0,
  });
  const [barError, setBarError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [guest, setGuest] = useState({
    guest_name: '',
    mobile_number: '',
    email: '',
    special_requests: '',
    children_ages: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const heroImage =
    property?.photos?.find((p) => p.is_primary)?.photo ||
    property?.photos?.[0]?.photo ||
    null;

  const today = new Date().toISOString().split('T')[0];

  // Load cities on mount
  useEffect(() => {
    citiesApi.list()
      .then((res) => {
        const list = res.data?.results ?? res.data;
        setCities(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
  }, []);

  // Pre-select city from the current property
  useEffect(() => {
    if (property?.city_id && cities.length > 0 && !bar.city) {
      setBar((b) => ({ ...b, city: property.city_id, venue: property.id }));
    }
  }, [property?.city_id, property?.id, cities.length, bar.city]);

  // Fetch properties when city changes
  useEffect(() => {
    if (!bar.city) { setCityProperties([]); return; }
    setLoadingProperties(true);
    propertiesApi.list({ city: bar.city })
      .then((res) => {
        const list = res.data?.results ?? res.data;
        setCityProperties(Array.isArray(list) ? list : []);
      })
      .catch(() => setCityProperties([]))
      .finally(() => setLoadingProperties(false));
  }, [bar.city]);

  // Keep children_ages array length in sync with count
  useEffect(() => {
    setGuest((g) => ({
      ...g,
      children_ages: Array.from(
        { length: bar.number_of_children },
        (_, i) => g.children_ages[i] ?? ''
      ),
    }));
  }, [bar.number_of_children]);

  const scrollToContent = () =>
    document.getElementById('property-info')?.scrollIntoView({ behavior: 'smooth' });

  const handleBarChange = (field, value) => {
    setBar((b) => {
      const next = { ...b, [field]: value };
      if (field === 'city') next.venue = '';
      if (field === 'check_in_date' && next.check_out_date && value >= next.check_out_date) {
        next.check_out_date = '';
      }
      return next;
    });
    setBarError('');
  };

  const handleBookNow = () => {
    if (!bar.city) { setBarError('Please select a city.'); return; }
    if (!bar.venue) { setBarError('Please select a property.'); return; }
    if (!bar.check_in_date) { setBarError('Please select a check-in date.'); return; }
    if (!bar.check_out_date) { setBarError('Please select a check-out date.'); return; }
    setBarError('');
    setSuccess(null);
    setSubmitError('');
    setGuest({
      guest_name: '',
      mobile_number: '',
      email: '',
      special_requests: '',
      children_ages: Array(bar.number_of_children).fill(''),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!guest.guest_name.trim()) { setSubmitError('Full name is required.'); return; }
    if (!/^\d{10}$/.test(guest.mobile_number.trim())) {
      setSubmitError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email.trim())) {
      setSubmitError('Enter a valid email address.');
      return;
    }
    if (
      bar.number_of_children > 0 &&
      guest.children_ages.some((a) => a === '' || isNaN(parseInt(a, 10)))
    ) {
      setSubmitError('Please enter age for each child (0–17).');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        guest_name: guest.guest_name.trim(),
        mobile_number: guest.mobile_number.trim(),
        email: guest.email.trim(),
        total_guests: bar.number_of_adults + bar.number_of_children,
        number_of_rooms: 1,
        number_of_adults: bar.number_of_adults,
        number_of_children: bar.number_of_children,
        children_ages: guest.children_ages.map((a) => parseInt(a, 10)),
        venue: bar.venue,
        check_in_date: bar.check_in_date,
        check_out_date: bar.check_out_date,
        special_requests: guest.special_requests.trim(),
      };
      const res = await bookingsApi.create(payload);
      setSuccess(res.data.booking.booking_reference);
    } catch (err) {
      const data = err.response?.data || {};
      const msg =
        typeof data === 'string'
          ? data
          : data?.non_field_errors?.[0] ||
            Object.values(data)[0]?.[0] ||
            err.message ||
            'Booking failed. Please try again.';
      setSubmitError(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (submitting) return;
    setDialogOpen(false);
    if (success) {
      setSuccess(null);
      setBar({
        city: property?.city_id || '',
        venue: property?.id || '',
        check_in_date: '',
        check_out_date: '',
        number_of_adults: 2,
        number_of_children: 0,
      });
    }
  };

  const nights =
    bar.check_in_date && bar.check_out_date
      ? Math.max(0, (new Date(bar.check_out_date) - new Date(bar.check_in_date)) / 86400000)
      : 0;

  const selectedProperty = cityProperties.find((p) => p.id === bar.venue) || property;

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: heroImage
            ? `url(${heroImage}) center/cover no-repeat`
            : 'linear-gradient(135deg, #2C1810 0%, #6B3A2A 35%, #FF6B35 70%, #FFD700 100%)',
          zIndex: 0,
        }}
      />

      {/* Decorative pattern */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3, py: { xs: 8, md: 12 } }}>
        <Box sx={{ maxWidth: 720 }}>
          {/* Property name */}
          <Typography
            variant="h1"
            sx={{
              color: '#FFFFFF',
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              mb: 1,
              textShadow: '0 2px 20px rgba(0,0,0,0.5)',
            }}
          >
            {property?.name || 'Preksha Hospitality'}
          </Typography>

          {/* Location */}
          {property?.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3 }}>
              <LocationOnIcon sx={{ color: '#FF6B35', fontSize: 18 }} />
              <Typography sx={{ color: '#FFD9C0', fontSize: '1rem', letterSpacing: '0.08em' }}>
                {property.location}, {property.city_name}
              </Typography>
            </Box>
          )}

          {/* Description */}
          <Typography
            variant="h5"
            sx={{
              color: 'rgba(255,217,192,0.9)',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.7,
              mb: 4,
              maxWidth: 600,
            }}
          >
            {property?.short_description ||
              'Where Every Stay is Divine — Experience Sacred Tranquility'}
          </Typography>
        </Box>

        {/* ── Quick Booking Bar ─────────────────────────────────────── */}
        <Box
            sx={{
              background: 'rgba(255,253,245,0.88)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,107,53,0.28)',
              borderRadius: 2.5,
              p: { xs: 2, md: 2.5 },
              mb: barError ? 0.5 : 2.5,
            }}
          >
            <Typography
              sx={{
                color: '#FF6B35',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              Quick Booking
            </Typography>

            <Grid container spacing={1.5} alignItems="flex-end">
              {/* City */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="City"
                  size="small"
                  fullWidth
                  value={bar.city}
                  onChange={(e) => handleBarChange('city', e.target.value)}
                  sx={BAR_FIELD_SX}
                >
                  {cities.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Property */}
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  label="Property"
                  size="small"
                  fullWidth
                  value={bar.venue}
                  onChange={(e) => handleBarChange('venue', Number(e.target.value))}
                  disabled={!bar.city || loadingProperties}
                  sx={BAR_FIELD_SX}
                >
                  {loadingProperties
                    ? <MenuItem value="">Loading…</MenuItem>
                    : cityProperties.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))
                  }
                </TextField>
              </Grid>

              {/* Check-in */}
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  label="Check-in"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  value={bar.check_in_date}
                  onChange={(e) => handleBarChange('check_in_date', e.target.value)}
                  sx={BAR_FIELD_SX}
                />
              </Grid>

              {/* Check-out */}
              <Grid item xs={6} sm={4} md={2}>
                <TextField
                  label="Check-out"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: bar.check_in_date || today }}
                  value={bar.check_out_date}
                  onChange={(e) => handleBarChange('check_out_date', e.target.value)}
                  sx={BAR_FIELD_SX}
                />
              </Grid>

              {/* Adults */}
              <Grid item xs={4} sm={2} md={1}>
                <TextField
                  select
                  label="Adults"
                  size="small"
                  fullWidth
                  value={bar.number_of_adults}
                  onChange={(e) => handleBarChange('number_of_adults', Number(e.target.value))}
                  sx={BAR_FIELD_SX}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Children */}
              <Grid item xs={4} sm={2} md={1}>
                <TextField
                  select
                  label="Children"
                  size="small"
                  fullWidth
                  value={bar.number_of_children}
                  onChange={(e) => handleBarChange('number_of_children', Number(e.target.value))}
                  sx={BAR_FIELD_SX}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Book Now */}
              <Grid item xs={4} sm={2} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleBookNow}
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    py: '7px',
                    whiteSpace: 'nowrap',
                    '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' },
                  }}
                >
                  Book Now
                </Button>
              </Grid>
            </Grid>

            {/* Nights summary hint */}
            {nights > 0 && (
              <Typography sx={{ color: 'rgba(44,24,16,0.52)', fontSize: '0.72rem', mt: 1.5 }}>
                {nights} night{nights !== 1 ? 's' : ''} &nbsp;·&nbsp; {bar.number_of_adults}{' '}
                adult{bar.number_of_adults !== 1 ? 's' : ''}
                {bar.number_of_children > 0
                  ? `, ${bar.number_of_children} child${bar.number_of_children !== 1 ? 'ren' : ''}`
                  : ''}
              </Typography>
            )}
        </Box>

        {barError && (
          <Typography sx={{ color: '#E55A25', fontSize: '0.78rem', mb: 2, pl: 0.5 }}>
            ⚠ {barError}
          </Typography>
        )}

        <Box sx={{ maxWidth: 720 }}>
          {/* Explore link */}
          <Box sx={{ mb: 4 }}>
            <Button
              component={Link}
              to="/rooms"
              variant="text"
              size="small"
              sx={{
                color: 'rgba(255,215,0,0.65)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                p: 0,
                '&:hover': { color: '#FFD700', backgroundColor: 'transparent' },
              }}
            >
              Explore Rooms &amp; Suites →
            </Button>
          </Box>

          {/* Feature chips */}
          {property?.property_amenities && (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {property.property_amenities
                .filter((pa) => pa.is_highlighted)
                .slice(0, 4)
                .map((pa) => (
                  <Chip
                    key={pa.amenity.id}
                    label={pa.amenity.name}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,107,53,0.2)',
                      color: '#FFD9C0',
                      border: '1px solid rgba(255,107,53,0.4)',
                      backdropFilter: 'blur(4px)',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
            </Stack>
          )}
        </Box>
      </Container>

      {/* Scroll indicator */}
      <Box
        onClick={scrollToContent}
        sx={{
          position: 'absolute',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          animation: 'bounce 2s infinite',
          '@keyframes bounce': {
            '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
            '50%': { transform: 'translateX(-50%) translateY(-8px)' },
          },
        }}
      >
        <Typography sx={{ color: 'rgba(255,215,0,0.7)', fontSize: '0.65rem', letterSpacing: '0.2em' }}>
          SCROLL
        </Typography>
        <KeyboardArrowDownIcon sx={{ color: '#FFD700', fontSize: 28 }} />
      </Box>

      {/* ── Guest Details Dialog ──────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(160deg, #FFFDF5 0%, #FFF3E0 100%)',
            border: '1px solid rgba(255,107,53,0.22)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: '#2C1810',
            fontFamily: '"Cinzel", serif',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          {success ? '🕉️  Booking Submitted!' : 'Complete Your Booking'}
          <IconButton onClick={handleDialogClose} disabled={submitting} sx={{ color: '#4A2C1A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {success ? (
            /* ── Success state ── */
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ color: '#2C1810', mb: 2, fontFamily: '"Cinzel", serif' }}
              >
                Request Received!
              </Typography>
              <Box
                sx={{
                  background: 'rgba(255,107,53,0.12)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  borderRadius: 2,
                  py: 2,
                  px: 4,
                  mb: 3,
                  display: 'inline-block',
                }}
              >
                <Typography
                  sx={{ color: '#FF6B35', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em' }}
                >
                  BOOKING REFERENCE
                </Typography>
                <Typography
                  sx={{
                    color: '#E55A25',
                    fontSize: '1.7rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    letterSpacing: 4,
                  }}
                >
                  {success}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: 'rgba(44,24,16,0.72)',
                  fontSize: '0.9rem',
                  lineHeight: 1.8,
                  maxWidth: 340,
                  mx: 'auto',
                }}
              >
                A confirmation email has been sent to{' '}
                <strong style={{ color: '#2C1810' }}>{guest.email || 'your email'}</strong>. Our
                team will confirm your booking within{' '}
                <strong style={{ color: '#2C1810' }}>2–4 hours</strong>.
              </Typography>
            </Box>
          ) : (
            /* ── Form ── */
            <>
              {/* Booking summary */}
              <Box
                sx={{
                  background: 'rgba(255,107,53,0.1)',
                  border: '1px solid rgba(255,107,53,0.25)',
                  borderRadius: 2,
                  p: 2,
                  mb: 3,
                }}
              >
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', letterSpacing: 1, display: 'block', mb: 0.25 }}
                    >
                      PROPERTY
                    </Typography>
                    <Typography sx={{ color: '#2C1810', fontWeight: 700, fontSize: '0.95rem' }}>
                      {selectedProperty?.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', letterSpacing: 1, display: 'block', mb: 0.25 }}
                    >
                      CHECK-IN
                    </Typography>
                    <Typography sx={{ color: '#4A2C1A', fontWeight: 600, fontSize: '0.88rem' }}>
                      {formatDate(bar.check_in_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', letterSpacing: 1, display: 'block', mb: 0.25 }}
                    >
                      CHECK-OUT
                    </Typography>
                    <Typography sx={{ color: '#4A2C1A', fontWeight: 600, fontSize: '0.88rem' }}>
                      {formatDate(bar.check_out_date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', display: 'block', mb: 0.25 }}
                    >
                      NIGHTS
                    </Typography>
                    <Typography sx={{ color: '#4A2C1A', fontWeight: 600, fontSize: '0.88rem' }}>
                      {nights}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', display: 'block', mb: 0.25 }}
                    >
                      ADULTS
                    </Typography>
                    <Typography sx={{ color: '#4A2C1A', fontWeight: 600, fontSize: '0.88rem' }}>
                      {bar.number_of_adults}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography
                      variant="caption"
                      sx={{ color: '#FF6B35', display: 'block', mb: 0.25 }}
                    >
                      CHILDREN
                    </Typography>
                    <Typography sx={{ color: '#4A2C1A', fontWeight: 600, fontSize: '0.88rem' }}>
                      {bar.number_of_children}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,107,53,0.18)', mb: 3 }} />

              {/* Guest details */}
              <TextField
                label="Full Name"
                value={guest.guest_name}
                onChange={(e) => setGuest((g) => ({ ...g, guest_name: e.target.value }))}
                fullWidth
                required
                sx={DIALOG_FIELD_SX}
              />
              <TextField
                label="Mobile Number"
                value={guest.mobile_number}
                onChange={(e) =>
                  setGuest((g) => ({
                    ...g,
                    mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10),
                  }))
                }
                fullWidth
                required
                placeholder="10-digit number"
                InputProps={{
                  startAdornment: (
                    <Typography
                      sx={{ color: '#FF6B35', mr: 0.75, fontSize: '0.9rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                      +91
                    </Typography>
                  ),
                }}
                sx={DIALOG_FIELD_SX}
              />
              <TextField
                label="Email Address"
                type="email"
                value={guest.email}
                onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                fullWidth
                required
                sx={DIALOG_FIELD_SX}
              />

              {/* Children ages (shown only when children > 0) */}
              {bar.number_of_children > 0 && (
                <>
                  <Typography
                    sx={{
                      color: '#FF6B35',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      mb: 1,
                    }}
                  >
                    Children's Ages (years)
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                    {Array.from({ length: bar.number_of_children }).map((_, i) => (
                      <Grid item xs={4} sm={3} key={i}>
                        <TextField
                          label={`Child ${i + 1}`}
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 0, max: 17 }}
                          value={guest.children_ages[i] ?? ''}
                          onChange={(e) => {
                            const ages = [...guest.children_ages];
                            ages[i] = e.target.value;
                            setGuest((g) => ({ ...g, children_ages: ages }));
                          }}
                          sx={DIALOG_FIELD_SX}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </>
              )}

              <TextField
                label="Special Requests (optional)"
                value={guest.special_requests}
                onChange={(e) => setGuest((g) => ({ ...g, special_requests: e.target.value }))}
                fullWidth
                multiline
                rows={3}
                sx={{ ...DIALOG_FIELD_SX, mb: 0 }}
              />

              {submitError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {submitError}
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0.5 }}>
          {success ? (
            <Button
              onClick={handleDialogClose}
              variant="contained"
              fullWidth
              sx={{
                background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                color: '#fff',
                fontWeight: 700,
                py: 1.25,
                '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' },
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                onClick={handleDialogClose}
                disabled={submitting}
                sx={{ color: 'rgba(44,24,16,0.45)' }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.25,
                  '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' },
                  '&.Mui-disabled': { opacity: 0.5 },
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Booking Request'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
