import React from 'react';
import { Box, Container, Typography, Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import SectionHeading from '../common/SectionHeading';
import PolicyAccordionList from '../common/PolicyAccordionList';
import { POLICY_SECTIONS, POLICY_PDF_URL } from '../../data/bookingPolicy';

export default function BookingPolicy({ property }) {
  return (
    <Box id="booking-policy" sx={{ py: { xs: 8, md: 12 }, backgroundColor: '#FBF3E7' }}>
      <Container maxWidth="lg">
        <SectionHeading
          preTitle="Please Read Before You Book"
          title="General Booking Policy"
          subtitle="Kindly review these terms carefully — they apply to every reservation and will also be shared with you in your booking request and confirmation emails."
        />

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

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            component="a"
            href={POLICY_PDF_URL}
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            sx={{
              borderColor: '#FF6B35',
              color: '#FF6B35',
              '&:hover': { borderColor: '#E85A2A', backgroundColor: 'rgba(255,107,53,0.06)' },
            }}
          >
            Download Policy PDF
          </Button>
        </Box>

        <Typography sx={{ textAlign: 'center', color: '#6B4226', fontSize: '0.85rem', mt: 3 }}>
          Read the full{' '}
          <Typography
            component={Link}
            to="/booking-policy"
            sx={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Booking Policy page
          </Typography>
          {property?.primary_phone && <> or call us at <strong style={{ color: '#FF6B35' }}>{property.primary_phone}</strong>.</>}
        </Typography>
      </Container>
    </Box>
  );
}
