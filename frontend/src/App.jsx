import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import RoomsPage from './pages/RoomsPage';
import AmenitiesPage from './pages/AmenitiesPage';
import BookingPage from './pages/BookingPage';
import BookingPolicyPage from './pages/BookingPolicyPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/manage/LoginPage';
import BookingManagement from './pages/manage/BookingManagement';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public website */}
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/amenities" element={<AmenitiesPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking-policy" element={<BookingPolicyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/gallery" element={<RoomsPage />} />

              {/* Booking Management System */}
              <Route path="/manage/login" element={<LoginPage />} />
              <Route path="/manage" element={<BookingManagement />} />
              <Route path="/manage/*" element={<BookingManagement />} />

              {/* Legacy redirect */}
              <Route path="/leads" element={<Navigate to="/manage" replace />} />
              <Route path="/leads/*" element={<Navigate to="/manage" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
