import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, TextField, Button, Typography,
  MenuItem, Paper, Alert, Stepper, Step, StepLabel,
  Divider, Chip, CircularProgress, IconButton, InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import HotelIcon from '@mui/icons-material/Hotel';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { bookingsApi, propertiesApi } from '../../services/api';
import { useProperties } from '../../hooks/useProperty';
import SectionHeading from '../common/SectionHeading';

const STEPS = ['Guest Details', 'Stay Details', 'Guest Composition', 'Review & Submit'];

function ChildAgeInput({ index, value, onChange }) {
  return (
    <TextField
      label={`Child ${index + 1} Age`}
      type="number"
      value={value}
      onChange={(e) => onChange(index, Number(e.target.value))}
      inputProps={{ min: 0, max: 17 }}
      size="small"
      fullWidth
      InputProps={{
        endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
      }}
    />
  );
}

export default function BookingForm({ propertyId, preselectedRoomId }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [error, setError] = useState('');
  const [property, setProperty] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // All properties for the selector (only needed when no propertyId pre-selected)
  const { properties: allProperties } = useProperties();

  const [form, setForm] = useState({
    guest_name: '',
    mobile_number: '',
    email: '',
    total_guests: 2,
    number_of_rooms: 1,
    number_of_adults: 2,
    number_of_children: 0,
    children_ages: [],
    venue: propertyId || '',
    room_category: preselectedRoomId || '',
    check_in_date: null,
    check_out_date: null,
    special_requests: '',
  });

  // Load property detail whenever venue selection changes
  useEffect(() => {
    const venueId = propertyId || form.venue;
    if (venueId) {
      propertiesApi.get(venueId).then((res) => setProperty(res.data)).catch(() => {});
    } else {
      setProperty(null);
    }
  }, [propertyId, form.venue]);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleChildrenCount = (delta) => {
    const newCount = Math.max(0, form.number_of_children + delta);
    const newAges = [...form.children_ages];
    if (delta > 0) {
      newAges.push(0);
    } else {
      newAges.pop();
    }
    const newTotal = form.number_of_adults + newCount;
    setForm((prev) => ({
      ...prev,
      number_of_children: newCount,
      children_ages: newAges,
      total_guests: newTotal,
    }));
  };

  const handleAdultsChange = (delta) => {
    const newAdults = Math.max(1, form.number_of_adults + delta);
    setForm((prev) => ({
      ...prev,
      number_of_adults: newAdults,
      total_guests: newAdults + prev.number_of_children,
    }));
  };

  const handleChildAge = (index, age) => {
    const ages = [...form.children_ages];
    ages[index] = age;
    setForm((prev) => ({ ...prev, children_ages: ages }));
  };

  const validateStep = () => {
    const errors = {};
    if (activeStep === 0) {
      if (!form.guest_name.trim()) errors.guest_name = 'Name is required';
      if (!form.mobile_number.trim()) errors.mobile_number = 'Mobile number is required';
      else if (!/^[6-9]\d{9}$/.test(form.mobile_number.replace(/\s/g, '')))
        errors.mobile_number = 'Enter valid 10-digit mobile number';
      if (!form.email.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = 'Enter valid email address';
    }
    if (activeStep === 1) {
      if (!form.venue) errors.venue = 'Please select a property';
      if (!form.check_in_date) errors.check_in_date = 'Check-in date is required';
      if (!form.check_out_date) errors.check_out_date = 'Check-out date is required';
      if (form.check_in_date && form.check_out_date) {
        if (dayjs(form.check_out_date).isBefore(dayjs(form.check_in_date)) ||
            dayjs(form.check_out_date).isSame(dayjs(form.check_in_date))) {
          errors.check_out_date = 'Check-out must be after check-in';
        }
      }
      if (form.number_of_rooms < 1) errors.number_of_rooms = 'At least 1 room required';
    }
    if (activeStep === 2) {
      if (form.number_of_children > 0) {
        form.children_ages.forEach((age, i) => {
          if (age === '' || age === null || age === undefined || isNaN(age)) {
            errors[`child_age_${i}`] = `Please enter age for child ${i + 1}`;
          }
        });
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setActiveStep((s) => s - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        check_in_date: form.check_in_date ? dayjs(form.check_in_date).format('YYYY-MM-DD') : null,
        check_out_date: form.check_out_date ? dayjs(form.check_out_date).format('YYYY-MM-DD') : null,
        room_category: form.room_category || null,
      };
      const res = await bookingsApi.create(payload);
      setBookingResult(res.data.booking);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nights =
    form.check_in_date && form.check_out_date
      ? dayjs(form.check_out_date).diff(dayjs(form.check_in_date), 'day')
      : 0;

  const selectedRoom = property?.room_categories?.find((r) => r.id === Number(form.room_category));

  if (submitted && bookingResult) {
    return (
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFF8F0', minHeight: '70vh' }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              textAlign: 'center',
              border: '2px solid #4CAF50',
              borderRadius: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🙏</Typography>
            <Typography
              variant="h4"
              sx={{ fontFamily: '"Cinzel", serif', color: '#2C1810', mb: 1 }}
            >
              Dhanyavaad!
            </Typography>
            <Typography variant="body1" sx={{ color: '#6B4226', mb: 3 }}>
              Your booking request has been submitted. Our team will confirm shortly.
            </Typography>

            <Box
              sx={{
                background: 'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
                borderRadius: 2,
                p: 3,
                mb: 3,
                border: '1px solid #FFD9C0',
              }}
            >
              <Typography variant="overline" sx={{ color: '#FF6B35', letterSpacing: '0.2em' }}>
                Booking Reference
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Cinzel", serif',
                  color: '#2C1810',
                  letterSpacing: '0.15em',
                  my: 1,
                }}
              >
                {bookingResult.booking_reference}
              </Typography>
              <Chip label="PENDING CONFIRMATION" color="warning" size="small" />
            </Box>

            <Grid container spacing={2} sx={{ textAlign: 'left', mb: 3 }}>
              {[
                { label: 'Check-in', value: dayjs(bookingResult.check_in_date).format('DD MMM YYYY') },
                { label: 'Check-out', value: dayjs(bookingResult.check_out_date).format('DD MMM YYYY') },
                { label: 'Guests', value: bookingResult.total_guests },
                { label: 'Rooms', value: bookingResult.number_of_rooms },
              ].map((item) => (
                <Grid item xs={6} key={item.label}>
                  <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2C1810', fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Alert severity="success" sx={{ textAlign: 'left', mb: 2 }}>
              A confirmation email has been sent to <strong>{bookingResult.email}</strong>.
            </Alert>

            <Button
              variant="contained"
              color="primary"
              href="/"
              sx={{ mt: 1 }}
            >
              Back to Home
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFF8F0' }}>
        <Container maxWidth="md">
          <SectionHeading
            preTitle="Reserve Your Stay"
            title="Booking Request"
            subtitle="Fill in the details below and our team will confirm your booking personally."
          />

          <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': { fontSize: { xs: '0.7rem', sm: '0.85rem' } },
                    '& .MuiStepIcon-root.Mui-active': { color: '#FF6B35' },
                    '& .MuiStepIcon-root.Mui-completed': { color: '#4CAF50' },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid #FFD9C0', borderRadius: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* STEP 0: Guest Details */}
            {activeStep === 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <PersonIcon sx={{ color: '#FF6B35' }} />
                  <Typography variant="h6" sx={{ color: '#2C1810' }}>Guest Information</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name *"
                      value={form.guest_name}
                      onChange={(e) => set('guest_name', e.target.value)}
                      fullWidth
                      error={!!fieldErrors.guest_name}
                      helperText={fieldErrors.guest_name}
                      placeholder="As per ID proof"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Mobile Number *"
                      value={form.mobile_number}
                      onChange={(e) => set('mobile_number', e.target.value)}
                      fullWidth
                      error={!!fieldErrors.mobile_number}
                      helperText={fieldErrors.mobile_number}
                      placeholder="10-digit mobile number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ fontSize: 18, color: '#FF6B35' }} /> +91
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email ID *"
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      fullWidth
                      error={!!fieldErrors.email}
                      helperText={fieldErrors.email}
                      placeholder="Confirmation sent here"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ fontSize: 18, color: '#FF6B35' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 1: Stay Details */}
            {activeStep === 1 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <EventIcon sx={{ color: '#FF6B35' }} />
                  <Typography variant="h6" sx={{ color: '#2C1810' }}>Stay Details</Typography>
                </Box>
                <Grid container spacing={3}>
                  {/* Property selector — shown when no propertyId is pre-set */}
                  {!propertyId && (
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Select Property *"
                        value={form.venue}
                        onChange={(e) => {
                          set('venue', e.target.value);
                          set('room_category', '');
                        }}
                        fullWidth
                        error={!!fieldErrors.venue}
                        helperText={fieldErrors.venue}
                        InputProps={{ startAdornment: <InputAdornment position="start"><HotelIcon sx={{ fontSize: 18, color: '#FF6B35' }} /></InputAdornment> }}
                      >
                        <MenuItem value="">— Choose a property —</MenuItem>
                        {allProperties.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                              <Typography variant="caption" sx={{ color: '#6B4226' }}>{p.location}, {p.city_name}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}

                  {/* Locked property info when pre-selected */}
                  {propertyId && property && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
                          borderRadius: 2,
                          border: '1px solid #FFD9C0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <HotelIcon sx={{ color: '#FF6B35' }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#2C1810', fontWeight: 700 }}>
                            {property.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6B4226' }}>
                            {property.location}, {property.city_name}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {property?.room_categories?.length > 0 && (
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Room Category (Optional)"
                        value={form.room_category}
                        onChange={(e) => set('room_category', e.target.value)}
                        fullWidth
                        helperText="Leave blank to let our team assign based on availability"
                      >
                        <MenuItem value="">Any Available Room</MenuItem>
                        {property.room_categories.filter((r) => r.is_active).map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span>{room.name}</span>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#FF6B35' }}>
                                <CurrencyRupeeIcon sx={{ fontSize: 14 }} />
                                <span>{Number(room.price_per_night).toLocaleString('en-IN')}/night</span>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Check-in Date *"
                      value={form.check_in_date}
                      onChange={(val) => set('check_in_date', val)}
                      minDate={dayjs()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!fieldErrors.check_in_date,
                          helperText: fieldErrors.check_in_date,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Check-out Date *"
                      value={form.check_out_date}
                      onChange={(val) => set('check_out_date', val)}
                      minDate={form.check_in_date ? dayjs(form.check_in_date).add(1, 'day') : dayjs().add(1, 'day')}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!fieldErrors.check_out_date,
                          helperText: fieldErrors.check_out_date,
                        },
                      }}
                    />
                  </Grid>

                  {nights > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${nights} Night${nights > 1 ? 's' : ''}`}
                          color="primary"
                          size="small"
                        />
                        {selectedRoom && (
                          <Chip
                            label={`Est. ₹${(Number(selectedRoom.price_per_night) * nights * form.number_of_rooms).toLocaleString('en-IN')}`}
                            variant="outlined"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Number of Rooms *"
                      type="number"
                      value={form.number_of_rooms}
                      onChange={(e) => set('number_of_rooms', Math.max(1, Number(e.target.value)))}
                      fullWidth
                      inputProps={{ min: 1, max: 20 }}
                      error={!!fieldErrors.number_of_rooms}
                      helperText={fieldErrors.number_of_rooms}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 2: Guest Composition */}
            {activeStep === 2 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <GroupIcon sx={{ color: '#FF6B35' }} />
                  <Typography variant="h6" sx={{ color: '#2C1810' }}>Guest Composition</Typography>
                </Box>
                <Grid container spacing={3}>
                  {/* Adults counter */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#6B4226', mb: 1, fontWeight: 600 }}>
                      Number of Adults *
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton
                        onClick={() => handleAdultsChange(-1)}
                        disabled={form.number_of_adults <= 1}
                        sx={{ border: '1px solid #FFD9C0' }}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="h5" sx={{ color: '#2C1810', minWidth: 32, textAlign: 'center' }}>
                        {form.number_of_adults}
                      </Typography>
                      <IconButton
                        onClick={() => handleAdultsChange(1)}
                        sx={{ border: '1px solid #FFD9C0' }}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  {/* Children counter */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#6B4226', mb: 1, fontWeight: 600 }}>
                      Number of Children
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IconButton
                        onClick={() => handleChildrenCount(-1)}
                        disabled={form.number_of_children <= 0}
                        sx={{ border: '1px solid #FFD9C0' }}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="h5" sx={{ color: '#2C1810', minWidth: 32, textAlign: 'center' }}>
                        {form.number_of_children}
                      </Typography>
                      <IconButton
                        onClick={() => handleChildrenCount(1)}
                        sx={{ border: '1px solid #FFD9C0' }}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  {/* Total guests */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, #FFF3E0, #FFE0CC)',
                        borderRadius: 2,
                        border: '1px solid #FFD9C0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#6B4226' }}>Total Guests</Typography>
                      <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 700 }}>
                        {form.total_guests}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Children ages */}
                  {form.number_of_children > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#6B4226', mb: 2, fontWeight: 600 }}>
                        Age of Children (in years)
                      </Typography>
                      <Grid container spacing={2}>
                        {form.children_ages.map((age, i) => (
                          <Grid item xs={6} sm={4} md={3} key={i}>
                            <ChildAgeInput
                              index={i}
                              value={age}
                              onChange={handleChildAge}
                            />
                            {fieldErrors[`child_age_${i}`] && (
                              <Typography variant="caption" color="error">
                                {fieldErrors[`child_age_${i}`]}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  )}

                  {/* Special requests */}
                  <Grid item xs={12}>
                    <TextField
                      label="Special Requests (Optional)"
                      value={form.special_requests}
                      onChange={(e) => set('special_requests', e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Any dietary requirements, accessibility needs, celebrations, etc."
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 3: Review */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ color: '#2C1810', mb: 3 }}>Review Your Booking</Typography>
                <Grid container spacing={3}>
                  {[
                    { section: 'Guest Details', items: [
                      { label: 'Name', value: form.guest_name },
                      { label: 'Mobile', value: `+91 ${form.mobile_number}` },
                      { label: 'Email', value: form.email },
                    ]},
                    { section: 'Stay Details', items: [
                      { label: 'Property', value: property?.name },
                      { label: 'Room', value: selectedRoom?.name || 'Any Available' },
                      { label: 'Check-in', value: form.check_in_date ? dayjs(form.check_in_date).format('DD MMM YYYY') : '—' },
                      { label: 'Check-out', value: form.check_out_date ? dayjs(form.check_out_date).format('DD MMM YYYY') : '—' },
                      { label: 'Nights', value: nights },
                      { label: 'Rooms', value: form.number_of_rooms },
                    ]},
                    { section: 'Guests', items: [
                      { label: 'Adults', value: form.number_of_adults },
                      { label: 'Children', value: form.number_of_children },
                      { label: 'Total', value: form.total_guests },
                      ...(form.number_of_children > 0 ? [{ label: 'Children Ages', value: form.children_ages.join(', ') + ' yrs' }] : []),
                    ]},
                  ].map((section) => (
                    <Grid item xs={12} key={section.section}>
                      <Typography variant="overline" sx={{ color: '#FF6B35', letterSpacing: '0.15em', display: 'block', mb: 1 }}>
                        {section.section}
                      </Typography>
                      <Box
                        sx={{
                          background: '#FFF3E0',
                          borderRadius: 2,
                          p: 2,
                          border: '1px solid #FFD9C0',
                        }}
                      >
                        <Grid container spacing={1}>
                          {section.items.map((item) => item.value ? (
                            <Grid item xs={6} sm={4} key={item.label}>
                              <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
                                {item.label}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2C1810', fontWeight: 600 }}>
                                {item.value}
                              </Typography>
                            </Grid>
                          ) : null)}
                        </Grid>
                      </Box>
                    </Grid>
                  ))}

                  {selectedRoom && nights > 0 && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2.5,
                          background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                          borderRadius: 2,
                          color: '#fff',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2">Estimated Total ({nights} nights × {form.number_of_rooms} room{form.number_of_rooms > 1 ? 's' : ''})</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CurrencyRupeeIcon />
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {(Number(selectedRoom.price_per_night) * nights * form.number_of_rooms).toLocaleString('en-IN')}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {form.special_requests && (
                    <Grid item xs={12}>
                      <Typography variant="caption" sx={{ color: '#888' }}>Special Requests</Typography>
                      <Typography variant="body2" sx={{ color: '#2C1810' }}>{form.special_requests}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 4 }} />

            {/* Navigation */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
                sx={{ minWidth: 100 }}
              >
                Back
              </Button>
              <Typography variant="caption" sx={{ color: '#888' }}>
                Step {activeStep + 1} of {STEPS.length}
              </Typography>
              {activeStep < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 100 }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ minWidth: 160 }}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
