import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Alert, CircularProgress,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { user, authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/manage', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(form);
      if (!userData.has_lead_access) {
        setError('Your account does not have access to the booking management system.');
        return;
      }
      navigate('/manage', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A0F08' }}>
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1A0F08 0%, #2C1810 50%, #3D1F0D 100%)',
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          maxWidth: 420,
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <img
            src="/logo-reference-no-background.png"
            alt="Preksha Hospitality"
            style={{ height: 110, width: 'auto', margin: '0 auto 16px', display: 'block' }}
          />
          <Typography
            variant="h5"
            sx={{ fontFamily: '"Cinzel", serif', color: '#FFD700', letterSpacing: '0.05em' }}
          >
            Booking Manager
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            fullWidth
            required
            autoFocus
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: '#FFD9C0',
                '& fieldset': { borderColor: 'rgba(255,215,0,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,217,192,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
            }}
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            fullWidth
            required
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#FFD9C0',
                '& fieldset': { borderColor: 'rgba(255,215,0,0.25)' },
                '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,217,192,0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
              color: '#fff',
              fontWeight: 700,
              py: 1.5,
              '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' },
              '&.Mui-disabled': { opacity: 0.5 },
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
