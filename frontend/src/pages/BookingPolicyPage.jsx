import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Container, Typography, Alert, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Layout from '../components/layout/Layout';
import BookingBanner from '../components/home/BookingBanner';
import SectionHeading from '../components/common/SectionHeading';
import PolicyAccordionList from '../components/common/PolicyAccordionList';
import { POLICY_SECTIONS, POLICY_PDF_URL } from '../data/bookingPolicy';
import { CANCELLATION_POLICY_SECTIONS } from '../data/cancellationPolicy';
import { useProperty } from '../hooks/useProperty';

const DEFAULT_PROPERTY_ID = process.env.REACT_APP_PROPERTY_ID || 1;

export default function BookingPolicyPage() {
  const { property, loading } = useProperty(DEFAULT_PROPERTY_ID);
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash || loading) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [hash, loading]);

  if (loading) return null;

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
            Please Read Before You Book
          </Typography>
          <Typography variant="h2" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
            General Booking Policy
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: 'rgba(255,217,192,0.85)', mt: 2, maxWidth: 620, mx: 'auto' }}
          >
            These terms apply to every reservation across our properties and are shared with you in your
            booking request and booking confirmation emails.
          </Typography>
          <Button
            component="a"
            href={POLICY_PDF_URL}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              mt: 3,
              backgroundColor: '#FF6B35',
              color: '#fff',
              '&:hover': { backgroundColor: '#E85A2A' },
            }}
          >
            Download Full Policy (PDF)
          </Button>
        </Container>
      </Box>

      {/* Policy content */}
      <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FBF3E7' }}>
        <Container maxWidth="lg">
          <Alert
            severity="warning"
            sx={{
              mb: 4,
              backgroundColor: '#FFF3E0',
              border: '1px solid #FFD9C0',
              color: '#2C1810',
              '& .MuiAlert-icon': { color: '#FF6B35' },
            }}
          >
            Unmarried couples and guests carrying local (Ayodhya/Faizabad area) ID proof are not permitted to check in.
            Non-vegetarian food, smoking, alcohol, and pets are strictly prohibited on the premises.
          </Alert>

          <PolicyAccordionList sections={POLICY_SECTIONS} />

          {property?.primary_phone && (
            <Typography sx={{ textAlign: 'center', color: '#6B4226', fontSize: '0.85rem', mt: 3 }}>
              Questions about our policies? Call us at <strong style={{ color: '#FF6B35' }}>{property.primary_phone}</strong>.
            </Typography>
          )}
        </Container>
      </Box>

      {/* Cancellation & Refund Policy */}
      <Box id="cancellation-policy" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FFF8F0' }}>
        <Container maxWidth="lg">
          <SectionHeading
            preTitle="Please Read Before You Book"
            title="Cancellation & Refund Policy"
            subtitle="To ensure smooth reservation management and availability for all guests, the following cancellation policy applies to all bookings unless otherwise agreed in writing."
          />

          <PolicyAccordionList sections={CANCELLATION_POLICY_SECTIONS} />

          {property?.primary_phone && (
            <Typography sx={{ textAlign: 'center', color: '#6B4226', fontSize: '0.85rem', mt: 3 }}>
              Questions about cancellations or refunds? Call us at <strong style={{ color: '#FF6B35' }}>{property.primary_phone}</strong>.
            </Typography>
          )}
        </Container>
      </Box>

      <BookingBanner property={property} />
    </Layout>
  );
}
