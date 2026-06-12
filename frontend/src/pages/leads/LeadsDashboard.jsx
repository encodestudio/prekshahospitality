import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Grid, Paper, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, MenuItem, IconButton, Tooltip, Badge, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  CircularProgress, Tabs, Tab, Stack, Collapse,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import { leadsApi } from '../../services/api';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'success', icon: '✅' },
  cancelled: { label: 'Cancelled', color: 'error', icon: '❌' },
  completed: { label: 'Completed', color: 'info', icon: '🏁' },
  no_show: { label: 'No Show', color: 'default', icon: '👻' },
};

function StatCard({ label, value, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        textAlign: 'center',
        border: `2px solid`,
        borderColor: `${color}.main`,
        borderRadius: 2,
        background: `linear-gradient(135deg, rgba(255,107,53,0.05), rgba(255,215,0,0.05))`,
      }}
    >
      <Typography sx={{ fontSize: '1.8rem', mb: 0.5 }}>{icon}</Typography>
      <Typography variant="h4" sx={{ color: `${color}.main`, fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </Typography>
    </Paper>
  );
}

function LeadDetailDialog({ lead, open, onClose, onStatusUpdate, onNoteAdd }) {
  const [status, setStatus] = useState(lead?.status || 'pending');
  const [adminNotes, setAdminNotes] = useState(lead?.admin_notes || '');
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [noteAdding, setNoteAdding] = useState(false);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setAdminNotes(lead.admin_notes || '');
    }
  }, [lead]);

  if (!lead) return null;

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await leadsApi.updateStatus(lead.id, { status, admin_notes: adminNotes });
      onStatusUpdate();
      onClose();
    } catch (e) {
      alert('Failed to update: ' + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setNoteAdding(true);
    try {
      await leadsApi.addNote(lead.id, { note: newNote });
      setNewNote('');
      onNoteAdd(lead.id);
    } catch (e) {
      alert('Failed to add note: ' + e.message);
    } finally {
      setNoteAdding(false);
    }
  };

  const nights = dayjs(lead.check_out_date).diff(dayjs(lead.check_in_date), 'day');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #2C1810, #4A2C1A)', color: '#FFD700' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif' }}>
              🕉️ Lead Details
            </Typography>
            <Typography variant="caption" sx={{ color: '#FFD9C0' }}>
              {lead.booking_reference}
            </Typography>
          </Box>
          <Chip
            label={STATUS_CONFIG[lead.status]?.label}
            color={STATUS_CONFIG[lead.status]?.color}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Guest info */}
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="primary">Guest Information</Typography>
            {[
              ['Name', lead.guest_name],
              ['Mobile', lead.mobile_number],
              ['Email', lead.email],
              ['Total Guests', lead.total_guests],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#888', minWidth: 100 }}>{label}:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
              </Box>
            ))}
          </Grid>

          {/* Stay info */}
          <Grid item xs={12} md={6}>
            <Typography variant="overline" color="primary">Stay Details</Typography>
            {[
              ['Property', lead.property_name],
              ['Room', lead.room_category_name || 'Any Available'],
              ['Check-in', dayjs(lead.check_in_date).format('DD MMM YYYY')],
              ['Check-out', dayjs(lead.check_out_date).format('DD MMM YYYY')],
              ['Nights', nights],
              ['Rooms', lead.number_of_rooms],
              ['Adults', lead.number_of_adults],
              ['Children', lead.number_of_children],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#888', minWidth: 100 }}>{label}:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
              </Box>
            ))}
            {lead.number_of_children > 0 && lead.children_ages?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#888', minWidth: 100 }}>Ages:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{lead.children_ages.join(', ')} yrs</Typography>
              </Box>
            )}
          </Grid>

          {lead.special_requests && (
            <Grid item xs={12}>
              <Typography variant="overline" color="primary">Special Requests</Typography>
              <Typography variant="body2" sx={{ p: 1.5, background: '#FFF3E0', borderRadius: 1 }}>
                {lead.special_requests}
              </Typography>
            </Grid>
          )}

          {/* Status update */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" color="primary">Update Status</Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  fullWidth
                  size="small"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.icon} {cfg.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Admin Notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="overline" color="primary">Notes ({lead.lead_notes?.length || 0})</Typography>
            <Box sx={{ mt: 1, mb: 2 }}>
              {lead.lead_notes?.map((note) => (
                <Box
                  key={note.id}
                  sx={{ p: 1.5, background: '#FFF8F0', borderRadius: 1, mb: 1, border: '1px solid #FFD9C0' }}
                >
                  <Typography variant="body2">{note.note}</Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    {note.added_by_name} • {dayjs(note.created_at).format('DD MMM YYYY HH:mm')}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                size="small"
                fullWidth
                multiline
                maxRows={3}
              />
              <Button
                variant="outlined"
                onClick={handleAddNote}
                disabled={noteAdding || !newNote.trim()}
                startIcon={noteAdding ? <CircularProgress size={14} /> : <NoteAddIcon />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Add
              </Button>
            </Box>
          </Grid>

          {/* Activity log */}
          {lead.activities?.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="overline" color="primary">Activity Log</Typography>
              {lead.activities.slice(0, 5).map((act) => (
                <Box key={act.id} sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#FF6B35', minWidth: 120 }}>
                    {dayjs(act.created_at).format('DD MMM HH:mm')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6B4226' }}>
                    {act.description}
                  </Typography>
                </Box>
              ))}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button
          onClick={handleStatusUpdate}
          variant="contained"
          color="primary"
          disabled={updating}
          startIcon={updating ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const [leadsRes, statsRes] = await Promise.all([
        leadsApi.list(params),
        leadsApi.stats(),
      ]);
      setLeads(leadsRes.data.results || leadsRes.data);
      setStats(statsRes.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleOpenLead = async (lead) => {
    try {
      const res = await leadsApi.get(lead.id);
      setSelectedLead(res.data);
      setDialogOpen(true);
    } catch (e) {
      alert('Failed to load lead: ' + e.message);
    }
  };

  const handleRefreshNote = async (leadId) => {
    try {
      const res = await leadsApi.get(leadId);
      setSelectedLead(res.data);
    } catch (e) {}
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1A0F08 0%, #2C1810 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontFamily: '"Cinzel", serif', color: '#FFD700', letterSpacing: '0.05em' }}
            >
              🕉️ Lead Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#FFD9C0', mt: 0.5 }}>
              Preksha Hospitality — Booking Requests
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => setShowFilters((v) => !v)}
              sx={{ color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)' }}
            >
              <FilterListIcon />
            </IconButton>
            <IconButton
              onClick={fetchLeads}
              sx={{ color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Total', value: stats.total || 0, icon: '📋', color: 'primary' },
            { label: 'Pending', value: stats.pending || 0, icon: '⏳', color: 'warning' },
            { label: 'Confirmed', value: stats.confirmed || 0, icon: '✅', color: 'success' },
            { label: 'Completed', value: stats.completed || 0, icon: '🏁', color: 'info' },
            { label: 'Cancelled', value: stats.cancelled || 0, icon: '❌', color: 'error' },
          ].map((s) => (
            <Grid item xs={6} sm={4} md={2.4} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Collapse in={showFilters}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,215,0,0.15)',
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  placeholder="Search by name, mobile, reference..."
                  value={filters.search}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: '#FF6B35', mr: 1 }} />,
                    sx: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFD9C0' },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Filter by Status"
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                  fullWidth
                  size="small"
                  InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.08)', color: '#FFD9C0' } }}
                  InputLabelProps={{ sx: { color: '#FFD9C0' } }}
                >
                  <MenuItem value="">All</MenuItem>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <MenuItem key={key} value={key}>{cfg.icon} {cfg.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({ status: '', search: '' })}
                  fullWidth
                  sx={{ color: '#FFD9C0', borderColor: 'rgba(255,217,192,0.3)' }}
                >
                  Clear Filters
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
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,215,0,0.12)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'rgba(255,107,53,0.15)' }}>
                  {['Reference', 'Guest', 'Mobile', 'Property', 'Check-in', 'Check-out', 'Guests', 'Status', 'Action'].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: '#FFD700',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(255,215,0,0.15)',
                        whiteSpace: 'nowrap',
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
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5 }}>
                      <CircularProgress sx={{ color: '#FF6B35' }} />
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5, color: '#FFD9C0' }}>
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : leads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    sx={{
                      '&:hover': { background: 'rgba(255,107,53,0.06)' },
                      borderBottom: '1px solid rgba(255,215,0,0.06)',
                    }}
                  >
                    <TableCell sx={{ color: '#FF6B35', fontWeight: 700, fontSize: '0.8rem' }}>
                      {lead.booking_reference}
                    </TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem' }}>{lead.guest_name}</TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem' }}>{lead.mobile_number}</TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem' }}>{lead.property_name}</TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {dayjs(lead.check_in_date).format('DD MMM YY')}
                    </TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {dayjs(lead.check_out_date).format('DD MMM YY')}
                    </TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.85rem' }}>{lead.total_guests}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${STATUS_CONFIG[lead.status]?.icon} ${STATUS_CONFIG[lead.status]?.label}`}
                        color={STATUS_CONFIG[lead.status]?.color}
                        size="small"
                        sx={{ fontSize: '0.72rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View & Manage">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenLead(lead)}
                          sx={{ color: '#FF6B35' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {selectedLead && (
        <LeadDetailDialog
          lead={selectedLead}
          open={dialogOpen}
          onClose={() => { setDialogOpen(false); setSelectedLead(null); }}
          onStatusUpdate={fetchLeads}
          onNoteAdd={handleRefreshNote}
        />
      )}
    </Box>
  );
}
