import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Explicit token store — populated from login/me responses to avoid
// cross-port cookie access issues between :3000 and :8000 in dev.
let _csrfToken = '';
export function storeCsrfToken(token) {
  if (token) _csrfToken = token;
}

// Attach CSRF token to all mutating requests — cookie first, stored fallback
api.interceptors.request.use((config) => {
  const cookieMatch = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  const token = cookieMatch ? decodeURIComponent(cookieMatch[1]) : _csrfToken;
  if (token) config.headers['X-CSRFToken'] = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const err = new Error(
      error.response?.data?.detail || error.message || 'Something went wrong'
    );
    err.response = error.response;
    return Promise.reject(err);
  }
);

// Properties
export const propertiesApi = {
  list: (params) => api.get('/properties/', { params }),
  get: (id) => api.get(`/properties/${id}/`),
  getRooms: (id) => api.get(`/properties/${id}/rooms/`),
};

// Amenities
export const amenitiesApi = {
  list: () => api.get('/properties/amenities/'),
};

// Cities
export const citiesApi = {
  list: () => api.get('/properties/cities/'),
  get: (id) => api.get(`/properties/cities/${id}/`),
  create: (data) => api.post('/properties/cities/', data),
  update: (id, data) => api.patch(`/properties/cities/${id}/`, data),
  delete: (id) => api.delete(`/properties/cities/${id}/`),
  addPlace: (data) => api.post('/properties/cities-places/', data),
  updatePlace: (id, data) => api.patch(`/properties/cities-places/${id}/`, data),
  deletePlace: (id) => api.delete(`/properties/cities-places/${id}/`),
  addPhoto: (data) => api.post('/properties/cities-photos/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deletePhoto: (id) => api.delete(`/properties/cities-photos/${id}/`),
};

// Room Categories
export const roomsApi = {
  list: (params) => api.get('/properties/rooms/list/', { params }),
};

// Bookings (guest-facing)
export const bookingsApi = {
  create: (data) => api.post('/bookings/request/', data),
  getStatus: (reference) => api.get(`/bookings/status/${reference}/`),
};

// Leads / Booking Management (admin)
export const leadsApi = {
  list: (params) => api.get('/leads/', { params }),
  get: (id) => api.get(`/leads/${id}/`),
  create: (data) => api.post('/leads/create/', data),
  update: (id, data) => api.put(`/leads/${id}/`, data),
  patch: (id, data) => api.patch(`/leads/${id}/`, data),
  delete: (id) => api.delete(`/leads/${id}/`),
  updateStatus: (id, data) => api.patch(`/leads/${id}/status/`, data),
  addNote: (bookingId, data) => api.post(`/leads/${bookingId}/notes/`, data),
  stats: () => api.get('/leads/stats/'),
};

// Contact form (public)
export const contactApi = {
  submit: (data) => api.post('/leads/contact/', data),
};

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/me/'),
};

export default api;
