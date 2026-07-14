import React, { useState } from 'react';
import {
  Box, Container, Grid, Typography, Paper, Stack, Button,
  TextField, CircularProgress, Alert,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Layout from '../components/layout/Layout';
import BookingBanner from '../components/home/BookingBanner';
import SectionHeading from '../components/common/SectionHeading';
import LoadingScreen from '../components/common/LoadingScreen';
import { useProperty } from '../hooks/useProperty';
import { contactApi } from '../services/api';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingScreen message="Loading contact details..." />;

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.subject.trim()) errs.subject = 'Subject is required.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await contactApi.submit(form);
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const FIELD_SX = {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': { borderColor: '#FF6B35' },
      '&.Mui-focused fieldset': { borderColor: '#FF6B35' },
    },
    '& .MuiInputLabel-root.Mui-focused': { color: '#FF6B35' },
  };

  return (
    <Layout property={property}>
      <Box sx={{ background: 'linear-gradient(135deg, #2C1810, #4A2C1A)', py: { xs: 8, md: 10 }, textAlign: 'center' }}>
        <Container>
          <Typography sx={{ color: '#FF6B35', fontSize: '0.75rem', letterSpacing: '0.4em', textTransform: 'uppercase', mb: 1.5 }}>
            🕉️ &nbsp; Reach Us &nbsp; 🕉️
          </Typography>
          <Typography variant="h2" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
            Contact Us
          </Typography>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#FFF8F0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} justifyContent="center">
            {/* Contact details */}
            <Grid item xs={12} md={5}>
              <SectionHeading preTitle="Get in Touch" title="We're Here for You" center={false} />
              <Stack spacing={3}>
                {[
                  { icon: <LocationOnIcon sx={{ color: '#FF6B35', fontSize: 28 }} />, label: 'Address', value: property?.address },
                  ...(property?.phones || []).map((p) => ({
                    icon: <PhoneIcon sx={{ color: '#FF6B35', fontSize: 28 }} />,
                    label: p.label ? `Phone — ${p.label}` : 'Phone',
                    value: p.phone,
                    href: `tel:${p.phone}`,
                    key: `phone-${p.id}`,
                  })),
                  ...(property?.emails || []).map((e) => ({
                    icon: <EmailIcon sx={{ color: '#FF6B35', fontSize: 28 }} />,
                    label: e.label ? `Email — ${e.label}` : 'Email',
                    value: e.email,
                    href: `mailto:${e.email}`,
                    key: `email-${e.id}`,
                  })),
                  { icon: <WhatsAppIcon sx={{ color: '#25D366', fontSize: 28 }} />, label: 'WhatsApp', value: property?.whatsapp_number, href: `https://wa.me/${property?.whatsapp_number}` },
                ].filter((item) => item.value).map((item) => (
                  <Paper
                    key={item.key || item.label}
                    elevation={0}
                    sx={{ p: 2.5, display: 'flex', gap: 2, border: '1px solid #FFD9C0', borderRadius: 2 }}
                  >
                    {item.icon}
                    <Box>
                      <Typography variant="overline" sx={{ color: '#FF6B35', letterSpacing: '0.15em' }}>
                        {item.label}
                      </Typography>
                      {item.href ? (
                        <Typography
                          component="a"
                          href={item.href}
                          target={item.href.startsWith('https') ? '_blank' : '_self'}
                          rel="noopener noreferrer"
                          sx={{ display: 'block', color: '#2C1810', textDecoration: 'none', fontWeight: 500, '&:hover': { color: '#FF6B35' } }}
                        >
                          {item.value}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#2C1810' }}>{item.value}</Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Grid>

            {/* Contact form */}
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: '1px solid #FFD9C0',
                  borderRadius: 3,
                  background: '#fff',
                }}
              >
                {submitted ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 64, color: '#FF6B35', mb: 2 }} />
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', mb: 1.5 }}
                    >
                      Message Sent!
                    </Typography>
                    <Typography sx={{ color: '#6B4226', mb: 3, lineHeight: 1.8 }}>
                      Thank you for reaching out. A confirmation has been sent to your email and our team will get back to you within 24 hours.
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => setSubmitted(false)}
                      sx={{
                        borderColor: '#FF6B35',
                        color: '#FF6B35',
                        '&:hover': { borderColor: '#E55A2B', backgroundColor: '#FFF3E0' },
                      }}
                    >
                      Send Another Message
                    </Button>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: '"Playfair Display", serif', color: '#2C1810', mb: 0.5 }}
                    >
                      Send Us a Message
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B4226', mb: 3 }}>
                      Fill in the form below and we'll respond within 24 hours.
                    </Typography>

                    {submitError && (
                      <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          required
                          value={form.name}
                          onChange={handleChange('name')}
                          error={!!errors.name}
                          helperText={errors.name}
                          sx={FIELD_SX}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          type="email"
                          fullWidth
                          required
                          value={form.email}
                          onChange={handleChange('email')}
                          error={!!errors.email}
                          helperText={errors.email}
                          sx={FIELD_SX}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number (optional)"
                          fullWidth
                          value={form.phone}
                          onChange={handleChange('phone')}
                          sx={FIELD_SX}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Subject"
                          fullWidth
                          required
                          value={form.subject}
                          onChange={handleChange('subject')}
                          error={!!errors.subject}
                          helperText={errors.subject}
                          sx={FIELD_SX}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Your Message"
                          fullWidth
                          required
                          multiline
                          rows={5}
                          value={form.message}
                          onChange={handleChange('message')}
                          error={!!errors.message}
                          helperText={errors.message}
                          sx={FIELD_SX}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          size="large"
                          fullWidth
                          disabled={submitting}
                          endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                          sx={{ py: 1.5 }}
                        >
                          {submitting ? 'Sending…' : 'Send Message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <BookingBanner property={property} />
    </Layout>
  );
}
