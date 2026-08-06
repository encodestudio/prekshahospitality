import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Paper, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TextField, MenuItem, IconButton, Tooltip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  CircularProgress, Stack, Tabs, Tab, Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import dayjs from 'dayjs';
import { leadsApi, propertiesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  completed: { label: 'Completed', color: 'info' },
  no_show: { label: 'No Show', color: 'default', sx: { backgroundColor: '#7C3AED', color: '#fff' } },
};

const INITIAL_FORM = {
  guest_name: '',
  email: '',
  mobile_number: '',
  total_guests: 2,
  number_of_adults: 2,
  number_of_children: 0,
  children_ages: [],
  number_of_rooms: 1,
  venue: '',
  room_category: '',
  check_in_date: '',
  check_out_date: '',
  status: 'pending',
  special_requests: '',
  admin_notes: '',
};

const DARK_INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: 'rgba(255,215,0,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,215,0,0.4)' },
    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(255,217,192,0.7)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
  '& .MuiSelect-icon': { color: '#FFD9C0' },
};

function StatCard({ label, value, color, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        textAlign: 'center',
        border: '2px solid',
        borderColor: `${color}.main`,
        borderRadius: 2,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <Typography sx={{ fontSize: '1.6rem', mb: 0.5 }}>{icon}</Typography>
      <Typography variant="h4" sx={{ color: `${color}.main`, fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: '#FFD9C0', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </Typography>
    </Paper>
  );
}

// ─── Booking Form Dialog ────────────────────────────────────────────────────

function BookingFormDialog({ open, onClose, booking, onSaved }) {
  const isEdit = !!booking;
  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [properties, setProperties] = useState([]);
  const [venueRooms, setVenueRooms] = useState([]);
  const [fullBooking, setFullBooking] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    propertiesApi.list()
      .then((res) => setProperties(res.data.results || res.data))
      .catch(() => {});
  }, []);

  // Load rooms when venue changes
  useEffect(() => {
    if (formData.venue) {
      propertiesApi.getRooms(formData.venue)
        .then((res) => setVenueRooms(Array.isArray(res.data) ? res.data : res.data.results || []))
        .catch(() => setVenueRooms([]));
    } else {
      setVenueRooms([]);
    }
  }, [formData.venue]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) return;
    setTab(0);
    setErrors({});
    setSaveError('');
    setNewNote('');
    if (booking) {
      setFormData({
        guest_name: booking.guest_name || '',
        email: booking.email || '',
        mobile_number: booking.mobile_number || '',
        total_guests: booking.total_guests ?? 2,
        number_of_adults: booking.number_of_adults ?? 2,
        number_of_children: booking.number_of_children ?? 0,
        children_ages: booking.children_ages || [],
        number_of_rooms: booking.number_of_rooms ?? 1,
        venue: booking.venue || '',
        room_category: booking.room_category || '',
        check_in_date: booking.check_in_date || '',
        check_out_date: booking.check_out_date || '',
        status: booking.status || 'pending',
        special_requests: booking.special_requests || '',
        admin_notes: booking.admin_notes || '',
      });
      setFullBooking(booking);
    } else {
      setFormData(INITIAL_FORM);
      setFullBooking(null);
    }
  }, [booking, open]);

  const handleChange = (field, value) => {
    setFormData((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleAdultsChange = (val) => {
    const adults = Math.max(1, parseInt(val) || 1);
    setFormData((f) => ({ ...f, number_of_adults: adults, total_guests: adults + (f.number_of_children || 0) }));
  };

  const handleChildrenChange = (val) => {
    const count = Math.max(0, parseInt(val) || 0);
    setFormData((f) => ({
      ...f,
      number_of_children: count,
      children_ages: Array.from({ length: count }, (_, i) => f.children_ages[i] ?? ''),
      total_guests: (f.number_of_adults || 1) + count,
    }));
  };

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const handleVenueChange = (venueId) => {
    setFormData((f) => ({ ...f, venue: venueId, room_category: '' }));
  };

  const getFieldError = (field) => {
    const v = errors[field];
    if (!v) return '';
    return Array.isArray(v) ? v[0] : String(v);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        ...formData,
        venue: formData.venue ? parseInt(formData.venue) : null,
        room_category: formData.room_category ? parseInt(formData.room_category) : null,
        total_guests: parseInt(formData.total_guests) || 1,
        number_of_adults: parseInt(formData.number_of_adults) || 1,
        number_of_children: parseInt(formData.number_of_children) || 0,
        number_of_rooms: parseInt(formData.number_of_rooms) || 1,
        children_ages: formData.children_ages.map((a) => parseInt(a) || 0),
      };
      if (isEdit) {
        await leadsApi.patch(booking.id, payload);
      } else {
        await leadsApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.detail) {
        setErrors(data);
      } else {
        setSaveError(err.message || 'Save failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !booking) return;
    setAddingNote(true);
    try {
      await leadsApi.addNote(booking.id, { note: newNote.trim() });
      setNewNote('');
      // Re-fetch booking for updated notes list
      const res = await leadsApi.get(booking.id);
      setFullBooking(res.data);
      onSaved(); // Refresh stats/list in background
    } catch (e) {
      alert('Failed to add note: ' + e.message);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      {/* Header */}
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #2C1810, #4A2C1A)',
          color: '#FFD700',
          pb: isEdit ? 0 : 2,
        }}
      >
        <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', mb: isEdit ? 1 : 0 }}>
          {isEdit ? `Edit Booking — ${booking.booking_reference}` : 'New Booking'}
        </Typography>
        {isEdit && (
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              '& .MuiTab-root': { color: 'rgba(255,215,0,0.5)', fontSize: '0.8rem', minWidth: 120 },
              '& .Mui-selected': { color: '#FFD700' },
              '& .MuiTabs-indicator': { backgroundColor: '#FF6B35' },
            }}
          >
            <Tab label="Booking Details" />
            <Tab label={`Notes (${fullBooking?.lead_notes?.length || 0})`} />
            <Tab label="Activity Log" />
          </Tabs>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* ─── Tab 0: Booking Details ─── */}
        {tab === 0 && (
          <>
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {saveError}
              </Alert>
            )}
            {errors.non_field_errors && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getFieldError('non_field_errors')}
              </Alert>
            )}

            {/* Guest Details */}
            <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1.5, fontWeight: 700 }}>
              Guest Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Guest Name *" value={formData.guest_name} size="small" fullWidth
                  onChange={(e) => handleChange('guest_name', e.target.value)}
                  error={!!errors.guest_name} helperText={getFieldError('guest_name')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email *" type="email" value={formData.email} size="small" fullWidth
                  onChange={(e) => handleChange('email', e.target.value)}
                  error={!!errors.email} helperText={getFieldError('email')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Mobile Number *" value={formData.mobile_number} size="small" fullWidth
                  onChange={(e) => handleChange('mobile_number', e.target.value)}
                  error={!!errors.mobile_number} helperText={getFieldError('mobile_number')}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  label="Adults" type="number" value={formData.number_of_adults} size="small" fullWidth
                  onChange={(e) => handleAdultsChange(e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  label="Children" type="number" value={formData.number_of_children} size="small" fullWidth
                  onChange={(e) => handleChildrenChange(e.target.value)}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <TextField
                  label="Total Guests" value={formData.total_guests} size="small" fullWidth disabled
                  helperText="Auto-calculated"
                  error={!!errors.total_guests}
                />
              </Grid>

              {formData.number_of_children > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                    Children's Ages (years)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Array.from({ length: formData.number_of_children }, (_, i) => (
                      <TextField
                        key={i}
                        label={`Child ${i + 1}`}
                        type="number"
                        value={formData.children_ages[i] ?? ''}
                        onChange={(e) => {
                          const ages = [...formData.children_ages];
                          ages[i] = e.target.value;
                          handleChange('children_ages', ages);
                        }}
                        size="small"
                        sx={{ width: 84 }}
                        InputProps={{ inputProps: { min: 0, max: 17 } }}
                      />
                    ))}
                  </Box>
                  {errors.children_ages && (
                    <Typography variant="caption" color="error">{getFieldError('children_ages')}</Typography>
                  )}
                </Grid>
              )}
            </Grid>

            {/* Stay Details */}
            <Divider sx={{ mb: 2 }} />
            <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1.5, fontWeight: 700 }}>
              Stay Details
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Property *" value={formData.venue} size="small" fullWidth
                  onChange={(e) => handleVenueChange(e.target.value)}
                  error={!!errors.venue} helperText={getFieldError('venue')}
                >
                  <MenuItem value="">— Select Property —</MenuItem>
                  {properties.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Room Category" value={formData.room_category} size="small" fullWidth
                  onChange={(e) => handleChange('room_category', e.target.value)}
                  disabled={!formData.venue}
                  helperText={!formData.venue ? 'Select a property first' : ''}
                >
                  <MenuItem value="">Any Available Room</MenuItem>
                  {venueRooms.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Check-in Date *" type="date" value={formData.check_in_date} size="small" fullWidth
                  onChange={(e) => {
                    handleChange('check_in_date', e.target.value);
                    // clear check-out if it's now before the new check-in
                    if (formData.check_out_date && e.target.value >= formData.check_out_date) {
                      handleChange('check_out_date', '');
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  error={!!errors.check_in_date} helperText={getFieldError('check_in_date')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Check-out Date *" type="date" value={formData.check_out_date} size="small" fullWidth
                  onChange={(e) => handleChange('check_out_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: formData.check_in_date || today }}
                  error={!!errors.check_out_date} helperText={getFieldError('check_out_date')}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="No. of Rooms *" type="number" value={formData.number_of_rooms} size="small" fullWidth
                  onChange={(e) => handleChange('number_of_rooms', e.target.value)}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!errors.number_of_rooms} helperText={getFieldError('number_of_rooms')}
                />
              </Grid>
            </Grid>

            {/* Management */}
            <Divider sx={{ mb: 2 }} />
            <Typography variant="overline" color="primary" sx={{ display: 'block', mb: 1.5, fontWeight: 700 }}>
              Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select label="Status" value={formData.status} size="small" fullWidth
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Admin Notes" value={formData.admin_notes} size="small" fullWidth multiline rows={2}
                  onChange={(e) => handleChange('admin_notes', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Special Requests" value={formData.special_requests} size="small" fullWidth multiline rows={2}
                  onChange={(e) => handleChange('special_requests', e.target.value)}
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* ─── Tab 1: Notes ─── */}
        {tab === 1 && isEdit && (
          <Box>
            <Box sx={{ mb: 2, maxHeight: 320, overflowY: 'auto' }}>
              {!fullBooking?.lead_notes?.length && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No notes yet. Add the first note below.
                </Typography>
              )}
              {fullBooking?.lead_notes?.map((note) => (
                <Box
                  key={note.id}
                  sx={{ p: 1.5, background: '#FFF8F0', borderRadius: 1, mb: 1.5, border: '1px solid #FFD9C0' }}
                >
                  <Typography variant="body2">{note.note}</Typography>
                  <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
                    {note.added_by_name} &bull; {dayjs(note.created_at).format('DD MMM YYYY HH:mm')}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Add a note about this booking..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                size="small"
                fullWidth
                multiline
                maxRows={4}
              />
              <Button
                variant="outlined"
                onClick={handleAddNote}
                disabled={addingNote || !newNote.trim()}
                startIcon={addingNote ? <CircularProgress size={14} /> : <NoteAddIcon />}
                sx={{ whiteSpace: 'nowrap', alignSelf: 'flex-end' }}
              >
                Add Note
              </Button>
            </Box>
          </Box>
        )}

        {/* ─── Tab 2: Activity Log ─── */}
        {tab === 2 && isEdit && (
          <Box>
            {!fullBooking?.activities?.length && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No activity recorded yet.
              </Typography>
            )}
            {fullBooking?.activities?.map((act) => (
              <Box key={act.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#FF6B35', minWidth: 110, flexShrink: 0, pt: 0.2 }}>
                  {dayjs(act.created_at).format('DD MMM HH:mm')}
                </Typography>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#2C1810', display: 'block' }}>
                    {act.action_display}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B4226' }}>{act.description}</Typography>
                  {act.performed_by_name && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      by {act.performed_by_name}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {tab === 0 && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Booking'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

function DeleteConfirmDialog({ open, onClose, booking, onConfirm, deleting, error }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Booking</DialogTitle>
      <DialogContent>
        <Typography>
          Permanently delete booking{' '}
          <strong>{booking?.booking_reference}</strong> for{' '}
          <strong>{booking?.guest_name}</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          This cannot be undone. All notes and activity will be lost.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={deleting}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BookingManagement() {
  const { user, authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({ status: '', search: '', venue: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) navigate('/manage/login', { replace: true });
  }, [user, authLoading, navigate]);

  // Load properties for filter dropdown
  useEffect(() => {
    propertiesApi.list()
      .then((res) => setProperties(res.data.results || res.data))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const params = { page: page + 1, page_size: rowsPerPage };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.venue) params.venue = filters.venue;

      const [listRes, statsRes] = await Promise.all([
        leadsApi.list(params),
        leadsApi.stats(),
      ]);

      const data = listRes.data;
      setBookings(data.results || data);
      setTotalCount(data.count ?? (Array.isArray(data) ? data.length : 0));
      setStats(statsRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = async (row) => {
    try {
      const res = await leadsApi.get(row.id);
      setEditingBooking(res.data);
      setFormOpen(true);
    } catch (e) {
      alert('Failed to load booking: ' + e.message);
    }
  };

  const handleNew = () => { setEditingBooking(null); setFormOpen(true); };

  const handleDelete = (row) => { setDeleteTarget(row); setDeleteOpen(true); setDeleteError(''); };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await leadsApi.delete(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      setDeleteError(e.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // ignore errors — still clear state and redirect
    }
    navigate('/manage/login', { replace: true });
  };

  const handleFilterChange = (key, value) => {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A0F08' }}>
        <CircularProgress sx={{ color: '#FF6B35' }} />
      </Box>
    );
  }

  if (!user) return null;

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1A0F08 0%, #2C1810 100%)' }}>
      {/* Top Bar */}
      <Box
        sx={{
          background: 'rgba(26,15,8,0.95)',
          borderBottom: '1px solid rgba(255,215,0,0.15)',
          py: 1.5,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', color: '#FFD700', lineHeight: 1.2 }}>
            Booking Management
          </Typography>
          <Typography variant="caption" sx={{ color: '#FFD9C0' }}>
            Preksha Hospitality
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="body2" sx={{ color: '#FFD9C0', display: { xs: 'none', sm: 'block' } }}>
            {user.full_name || user.username}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlaceIcon />}
            onClick={() => navigate('/manage/attractions')}
            sx={{ color: '#FFD700', borderColor: 'rgba(255,215,0,0.4)', '&:hover': { borderColor: '#FFD700' } }}
          >
            Nearby Attractions
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ color: '#FF6B35', borderColor: 'rgba(255,107,53,0.4)', '&:hover': { borderColor: '#FF6B35' } }}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <>
        {/* Stats Row */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Total', value: stats.total || 0, color: 'primary', icon: '📋' },
            { label: 'Pending', value: stats.pending || 0, color: 'warning', icon: '⏳' },
            { label: 'Confirmed', value: stats.confirmed || 0, color: 'success', icon: '✅' },
            { label: 'Completed', value: stats.completed || 0, color: 'info', icon: '🏁' },
            { label: 'Cancelled', value: stats.cancelled || 0, color: 'error', icon: '❌' },
          ].map((s) => (
            <Grid item xs={6} sm={4} md={2.4} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* Action Bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNew}
              sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' } }}
            >
              New Booking
            </Button>
            <Tooltip title="Toggle Filters">
              <IconButton
                onClick={() => setShowFilters((v) => !v)}
                sx={{ color: showFilters ? '#FFD700' : 'rgba(255,215,0,0.5)', border: '1px solid rgba(255,215,0,0.3)' }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={fetchData}
                sx={{ color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Typography variant="caption" sx={{ color: '#FFD9C0' }}>
            {totalCount} booking{totalCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Filters Panel */}
        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  placeholder="Name, mobile, reference..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  fullWidth size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#FF6B35', mr: 1, fontSize: 18 }} />,
                    sx: { color: '#FFD9C0', background: 'rgba(255,255,255,0.06)' },
                  }}
                  sx={DARK_INPUT_SX}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select label="Status" value={filters.status} fullWidth size="small"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  InputProps={{ sx: { color: '#FFD9C0', background: 'rgba(255,255,255,0.06)' } }}
                  sx={DARK_INPUT_SX}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select label="Property" value={filters.venue} fullWidth size="small"
                  onChange={(e) => handleFilterChange('venue', e.target.value)}
                  InputProps={{ sx: { color: '#FFD9C0', background: 'rgba(255,255,255,0.06)' } }}
                  sx={DARK_INPUT_SX}
                >
                  <MenuItem value="">All Properties</MenuItem>
                  {properties.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined" fullWidth
                  onClick={() => { setPage(0); setFilters({ status: '', search: '', venue: '' }); }}
                  sx={{ color: '#FFD9C0', borderColor: 'rgba(255,217,192,0.3)', '&:hover': { borderColor: '#FFD9C0' } }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Table */}
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,215,0,0.12)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,107,53,0.12)' }}>
                  {['Reference', 'Guest', 'Mobile', 'Email', 'Property', 'Check-in', 'Check-out', 'Guests', 'Rooms', 'Status', 'Created', 'Actions'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: '#FFD700',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(255,215,0,0.15)',
                        whiteSpace: 'nowrap',
                        py: 1.5,
                        px: 1.5,
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress sx={{ color: '#FF6B35' }} />
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: 'center', py: 6, color: '#FFD9C0' }}>
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((b) => (
                    <TableRow
                      key={b.id}
                      sx={{
                        '&:hover': { background: 'rgba(255,107,53,0.05)' },
                        borderBottom: '1px solid rgba(255,215,0,0.06)',
                      }}
                    >
                      <TableCell sx={{ color: '#FF6B35', fontWeight: 700, fontSize: '0.78rem', px: 1.5 }}>
                        {b.booking_reference}
                      </TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.guest_name}</TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.mobile_number}</TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.email || '—'}</TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.property_name}</TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', whiteSpace: 'nowrap', px: 1.5 }}>
                        {dayjs(b.check_in_date).format('DD MMM YY')}
                      </TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', whiteSpace: 'nowrap', px: 1.5 }}>
                        {dayjs(b.check_out_date).format('DD MMM YY')}
                      </TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.total_guests}</TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{b.number_of_rooms}</TableCell>
                      <TableCell sx={{ px: 1.5 }}>
                        <Chip
                          label={STATUS_CONFIG[b.status]?.label || b.status}
                          color={STATUS_CONFIG[b.status]?.color || 'default'}
                          size="small"
                          sx={{ fontSize: '0.68rem', height: 22, ...STATUS_CONFIG[b.status]?.sx }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#FFD9C0', fontSize: '0.78rem', whiteSpace: 'nowrap', px: 1.5 }}>
                        {dayjs(b.created_at).format('DD MMM YY')}
                      </TableCell>
                      <TableCell sx={{ px: 1 }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Edit Booking">
                            <IconButton size="small" onClick={() => handleEdit(b)} sx={{ color: '#FFD700', p: 0.5 }}>
                              <EditIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Booking">
                            <IconButton size="small" onClick={() => handleDelete(b)} sx={{ color: '#FF4444', p: 0.5 }}>
                              <DeleteIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{
              color: '#FFD9C0',
              borderTop: '1px solid rgba(255,215,0,0.1)',
              '& .MuiTablePagination-selectIcon': { color: '#FFD9C0' },
              '& .MuiTablePagination-actions button': { color: '#FFD9C0' },
              '& .MuiTablePagination-actions button.Mui-disabled': { color: 'rgba(255,217,192,0.3)' },
            }}
          />
        </Paper>
        </>
      </Container>

      {/* Dialogs */}
      <BookingFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        booking={editingBooking}
        onSaved={() => { setFormOpen(false); fetchData(); }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => { if (!deleting) { setDeleteOpen(false); setDeleteTarget(null); setDeleteError(''); } }}
        booking={deleteTarget}
        onConfirm={confirmDelete}
        deleting={deleting}
        error={deleteError}
      />
    </Box>
  );

}
