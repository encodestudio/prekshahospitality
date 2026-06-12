import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Grid, Paper, Typography, Button, TextField, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Chip, Alert, CircularProgress, Tooltip, Stack, Tabs, Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PlaceIcon from '@mui/icons-material/Place';
import CloseIcon from '@mui/icons-material/Close';
import { citiesApi } from '../../services/api';

// ─── City Form Dialog ────────────────────────────────────────────────────────

function CityFormDialog({ open, onClose, city, onSaved }) {
  const isEdit = !!city;
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: '', state: '', description: '', about: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Places state
  const [places, setPlaces] = useState([]);
  const [placeForm, setPlaceForm] = useState({ name: '', description: '', distance: '', order: 0 });
  const [placePhotoFile, setPlacePhotoFile] = useState(null);
  const [addingPlace, setAddingPlace] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const placePhotoRef = useRef();

  // Photos state
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef();

  const [cityId, setCityId] = useState(null);

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setError('');
    setPlaceForm({ name: '', description: '', distance: '', order: 0 });
    setPlacePhotoFile(null);
    setEditingPlace(null);
    if (city) {
      setForm({ name: city.name, state: city.state || '', description: city.description || '', about: city.about || '', is_active: city.is_active });
      setCityId(city.id);
      setPlaces(city.places || []);
      setPhotos(city.photos || []);
    } else {
      setForm({ name: '', state: '', description: '', about: '', is_active: true });
      setCityId(null);
      setPlaces([]);
      setPhotos([]);
    }
  }, [city, open]);

  const handleSaveBasic = async () => {
    if (!form.name.trim()) { setError('City name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      let res;
      if (cityId) {
        res = await citiesApi.update(cityId, form);
      } else {
        res = await citiesApi.create(form);
        setCityId(res.data.id);
        setTab(1);
      }
      onSaved();
      if (cityId) onClose();
    } catch (e) {
      setError(e.response?.data?.name?.[0] || e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlace = async () => {
    if (!placeForm.name.trim()) return;
    if (!cityId) { setError('Save the city first before adding places.'); return; }
    setAddingPlace(true);
    try {
      const fd = new FormData();
      fd.append('city', cityId);
      fd.append('name', placeForm.name);
      fd.append('description', placeForm.description);
      fd.append('distance', placeForm.distance);
      fd.append('order', placeForm.order || 0);
      if (placePhotoFile) fd.append('photo', placePhotoFile);

      if (editingPlace) {
        await citiesApi.updatePlace(editingPlace.id, fd);
      } else {
        await citiesApi.addPlace(fd);
      }
      const res = await citiesApi.get(cityId);
      setPlaces(res.data.places || []);
      setPlaceForm({ name: '', description: '', distance: '', order: 0 });
      setPlacePhotoFile(null);
      setEditingPlace(null);
      onSaved();
    } catch (e) {
      setError('Failed to save place: ' + (e.message || ''));
    } finally {
      setAddingPlace(false);
    }
  };

  const handleDeletePlace = async (placeId) => {
    try {
      await citiesApi.deletePlace(placeId);
      setPlaces((p) => p.filter((pl) => pl.id !== placeId));
      onSaved();
    } catch (e) {
      setError('Failed to delete place.');
    }
  };

  const handleEditPlace = (place) => {
    setEditingPlace(place);
    setPlaceForm({ name: place.name, description: place.description || '', distance: place.distance || '', order: place.order || 0 });
    setPlacePhotoFile(null);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !cityId) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('city', cityId);
      fd.append('photo', file);
      await citiesApi.addPhoto(fd);
      const res = await citiesApi.get(cityId);
      setPhotos(res.data.photos || []);
      onSaved();
    } catch (e) {
      setError('Photo upload failed: ' + (e.message || ''));
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await citiesApi.deletePhoto(photoId);
      setPhotos((p) => p.filter((ph) => ph.id !== photoId));
      onSaved();
    } catch (e) {
      setError('Failed to delete photo.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #2C1810, #4A2C1A)', color: '#FFD700', pb: 0 }}>
        <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', mb: 1 }}>
          {isEdit ? `Edit City — ${city.name}` : 'Add New City'}
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { color: 'rgba(255,215,0,0.5)', fontSize: '0.8rem', minWidth: 130 },
            '& .Mui-selected': { color: '#FFD700' },
            '& .MuiTabs-indicator': { backgroundColor: '#FF6B35' },
          }}
        >
          <Tab label="Basic Details" />
          <Tab label={`Places (${places.length})`} disabled={!cityId && !isEdit} />
          <Tab label={`Photos (${photos.length})`} disabled={!cityId && !isEdit} />
        </Tabs>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {/* ── Tab 0: Basic Details ── */}
        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="City Name *" value={form.name} fullWidth size="small"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="State" value={form.state} fullWidth size="small"
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Short Description" value={form.description} fullWidth size="small"
                placeholder="A brief tagline about the city (max 500 chars)"
                inputProps={{ maxLength: 500 }}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                helperText={`${form.description.length}/500`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About the City" value={form.about} fullWidth multiline rows={7}
                placeholder="Detailed description — history, culture, significance, best time to visit..."
                onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
              />
            </Grid>
            {!cityId && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  After saving basic details, you can add places to visit and photos in the next tabs.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {/* ── Tab 1: Places to Visit ── */}
        {tab === 1 && (
          <Box>
            {/* Add/Edit place form */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, borderColor: 'rgba(255,107,53,0.25)', background: '#FFFDF5' }}>
              <Typography variant="overline" sx={{ color: '#FF6B35', display: 'block', mb: 1.5 }}>
                {editingPlace ? `Editing: ${editingPlace.name}` : 'Add Place to Visit'}
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Place Name *" value={placeForm.name} fullWidth size="small"
                    onChange={(e) => setPlaceForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={8} sm={4}>
                  <TextField
                    label="Distance from Hotel" value={placeForm.distance} fullWidth size="small"
                    placeholder="e.g., 2 km"
                    onChange={(e) => setPlaceForm((f) => ({ ...f, distance: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={4} sm={2}>
                  <TextField
                    label="Order" type="number" value={placeForm.order} fullWidth size="small"
                    onChange={(e) => setPlaceForm((f) => ({ ...f, order: e.target.value }))}
                    inputProps={{ min: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description" value={placeForm.description} fullWidth size="small" multiline rows={2}
                    onChange={(e) => setPlaceForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <input type="file" accept="image/*" ref={placePhotoRef} style={{ display: 'none' }} onChange={(e) => setPlacePhotoFile(e.target.files?.[0] || null)} />
                    <Button
                      size="small" variant="outlined" startIcon={<PhotoCameraIcon />}
                      onClick={() => placePhotoRef.current?.click()}
                      sx={{ borderColor: 'rgba(255,107,53,0.4)', color: '#E55A25' }}
                    >
                      {placePhotoFile ? placePhotoFile.name : 'Attach Photo (optional)'}
                    </Button>
                    {placePhotoFile && (
                      <IconButton size="small" onClick={() => setPlacePhotoFile(null)} sx={{ color: '#999' }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                    <Box sx={{ flex: 1 }} />
                    {editingPlace && (
                      <Button size="small" onClick={() => { setEditingPlace(null); setPlaceForm({ name: '', description: '', distance: '', order: 0 }); setPlacePhotoFile(null); }}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      variant="contained" size="small" onClick={handleAddPlace}
                      disabled={addingPlace || !placeForm.name.trim()}
                      startIcon={addingPlace ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                      sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
                    >
                      {editingPlace ? 'Update Place' : 'Add Place'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Places list */}
            {places.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No places added yet. Use the form above to add places to visit.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {places.map((place) => (
                  <Paper key={place.id} variant="outlined" sx={{ p: 1.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    {place.photo ? (
                      <Box component="img" src={place.photo} alt={place.name} sx={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} />
                    ) : (
                      <Box sx={{ width: 72, height: 56, background: '#FFF3E0', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <PlaceIcon sx={{ color: '#FF6B35', fontSize: 28 }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle2" sx={{ color: '#2C1810', fontWeight: 700 }}>{place.name}</Typography>
                        {place.distance && <Chip label={place.distance} size="small" sx={{ fontSize: '0.68rem', height: 18 }} />}
                      </Box>
                      {place.description && (
                        <Typography variant="caption" sx={{ color: '#6B4226', display: 'block', mt: 0.25 }}>
                          {place.description.length > 100 ? place.description.slice(0, 100) + '…' : place.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEditPlace(place)} sx={{ color: '#FFD700' }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeletePlace(place.id)} sx={{ color: '#FF4444' }}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* ── Tab 2: Photos ── */}
        {tab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="overline" sx={{ color: '#FF6B35' }}>City Photos</Typography>
              <Box>
                <input type="file" accept="image/*" ref={photoInputRef} style={{ display: 'none' }} onChange={handlePhotoUpload} />
                <Button
                  variant="contained" size="small"
                  startIcon={uploadingPhoto ? <CircularProgress size={14} color="inherit" /> : <PhotoCameraIcon />}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
                >
                  {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                </Button>
              </Box>
            </Box>

            {photos.length === 0 ? (
              <Box
                sx={{
                  border: '2px dashed rgba(255,107,53,0.3)',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  background: '#FFFDF5',
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 48, color: 'rgba(255,107,53,0.3)', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No photos yet. Click "Upload Photo" to add city images.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {photos.map((photo) => (
                  <Grid item xs={6} sm={4} md={3} key={photo.id}>
                    <Box sx={{ position: 'relative', borderRadius: 1.5, overflow: 'hidden', border: '1px solid #FFD9C0' }}>
                      <Box
                        component="img"
                        src={photo.photo}
                        alt={photo.caption || 'City photo'}
                        sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.55)',
                          borderRadius: 1,
                        }}
                      >
                        <Tooltip title="Delete photo">
                          <IconButton size="small" onClick={() => handleDeletePhoto(photo.id)} sx={{ color: '#fff', p: 0.4 }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      {photo.caption && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', px: 1, py: 0.5, color: '#4A2C1A', fontSize: '0.7rem', background: '#FFF3E0' }}
                        >
                          {photo.caption}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        {tab === 0 && (
          <Button
            variant="contained" onClick={handleSaveBasic} disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)' }}
          >
            {saving ? 'Saving…' : cityId ? 'Save Changes' : 'Save & Continue'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────────────

function DeleteCityDialog({ open, onClose, city, onConfirm, deleting, error }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete City</DialogTitle>
      <DialogContent>
        <Typography>
          Permanently delete <strong>{city?.name}</strong>?
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          All associated places to visit and photos will also be deleted.
        </Alert>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={deleting}
          startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main CitiesManagement ───────────────────────────────────────────────────

export default function CitiesManagement() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchCities = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await citiesApi.list();
      setCities(res.data.results ?? res.data);
    } catch (e) {
      setError(e.message || 'Failed to load cities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const handleEdit = async (city) => {
    const res = await citiesApi.get(city.id);
    setEditingCity(res.data);
    setFormOpen(true);
  };

  const handleNew = () => { setEditingCity(null); setFormOpen(true); };

  const handleDelete = (city) => { setDeleteTarget(city); setDeleteOpen(true); setDeleteError(''); };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await citiesApi.delete(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchCities();
    } catch (e) {
      setDeleteError(e.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* Action bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: '"Cinzel", serif' }}>
          City Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={handleNew}
            sx={{ background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', '&:hover': { background: 'linear-gradient(135deg, #E55A25, #E07535)' } }}
          >
            Add City
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCities} sx={{ color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ background: 'rgba(255,107,53,0.12)' }}>
                {['City', 'State', 'Description', 'Places', 'Photos', 'Status', 'Actions'].map((h) => (
                  <TableCell
                    key={h}
                    sx={{ color: '#FFD700', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,215,0,0.15)', py: 1.5, px: 1.5 }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress sx={{ color: '#FF6B35' }} />
                  </TableCell>
                </TableRow>
              ) : cities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#FFD9C0' }}>
                    No cities added yet. Click "Add City" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                cities.map((city) => (
                  <TableRow key={city.id} sx={{ '&:hover': { background: 'rgba(255,107,53,0.05)' }, borderBottom: '1px solid rgba(255,215,0,0.06)' }}>
                    <TableCell sx={{ color: '#FFD700', fontWeight: 700, fontSize: '0.88rem', px: 1.5 }}>{city.name}</TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5 }}>{city.state || '—'}</TableCell>
                    <TableCell sx={{ color: '#FFD9C0', fontSize: '0.82rem', px: 1.5, maxWidth: 260 }}>
                      <Typography noWrap variant="body2" sx={{ color: '#FFD9C0', fontSize: '0.82rem' }}>
                        {city.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ px: 1.5 }}>
                      <Chip label={city.place_count} size="small" icon={<PlaceIcon />}
                        sx={{ fontSize: '0.72rem', height: 22, color: '#FFD9C0', '& .MuiChip-icon': { color: '#FF6B35', fontSize: 14 } }} />
                    </TableCell>
                    <TableCell sx={{ px: 1.5 }}>
                      <Chip label={city.photo_count} size="small" icon={<PhotoCameraIcon />}
                        sx={{ fontSize: '0.72rem', height: 22, color: '#FFD9C0', '& .MuiChip-icon': { color: '#FF6B35', fontSize: 14 } }} />
                    </TableCell>
                    <TableCell sx={{ px: 1.5 }}>
                      <Chip label={city.is_active ? 'Active' : 'Inactive'} size="small"
                        color={city.is_active ? 'success' : 'default'}
                        sx={{ fontSize: '0.68rem', height: 22 }} />
                    </TableCell>
                    <TableCell sx={{ px: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEdit(city)} sx={{ color: '#FFD700', p: 0.5 }}>
                            <EditIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(city)} sx={{ color: '#FF4444', p: 0.5 }}>
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
      </Paper>

      <CityFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        city={editingCity}
        onSaved={fetchCities}
      />
      <DeleteCityDialog
        open={deleteOpen}
        onClose={() => { if (!deleting) { setDeleteOpen(false); setDeleteTarget(null); } }}
        city={deleteTarget}
        onConfirm={confirmDelete}
        deleting={deleting}
        error={deleteError}
      />
    </Box>
  );
}
