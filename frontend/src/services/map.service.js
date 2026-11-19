// src/services/map.service.js
import api from './api';

const mapService = {
  // General Map Data
  async getAll(params = {}) {
    const response = await api.get('/api/map/all', { params });
    return response.data;
  },

  async getHeatmap(days = 30) {
    const response = await api.get('/api/map/heatmap', { params: { days } });
    return response.data;
  },

  async getClusters(params = {}) {
    const response = await api.get('/api/map/clusters', { params });
    return response.data;
  },

  async getBounds() {
    const response = await api.get('/api/map/bounds');
    return response.data;
  },

  // Sightings Map
  async getSightings(params = {}) {
    const response = await api.get('/api/map/sightings', { params });
    return response.data;
  },

  async getSightingsNearby(lat, lng, radius = 50) {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    if (radius) params.append('radius', radius);

    const response = await api.get(`/api/map/sightings/nearby?${params.toString()}`);
    return response.data;
  },

  async getSightingClusters(params = {}) {
    const response = await api.get('/api/map/sightings/clusters', { params });
    return response.data;
  },

  // Missing Persons Map
  async getMissing(params = {}) {
    const response = await api.get('/api/map/missing', { params });
    return response.data;
  },

  async getMissingNearby(lat, lng, radius = 50) {
    const params = new URLSearchParams();
    params.append('lat', lat);
    params.append('lng', lng);
    if (radius) params.append('radius', radius);

    const response = await api.get(`/api/map/missing/nearby?${params.toString()}`);
    return response.data;
  },

  async updateMissingCoordinates(id, coordinates) {
    const payload = {
      lat: coordinates.lat ?? coordinates.latitude,
      lng: coordinates.lng ?? coordinates.longitude,
      accuracy: coordinates.accuracy,
      source: coordinates.source,
    };
    const response = await api.put(`/api/map/missing/${id}/coordinates`, payload);
    return response.data;
  },

  // Admin Geocoding
  async batchGeocode() {
    const response = await api.post('/api/map/admin/geocode-batch');
    return response.data;
  },

  async geocodeTest(address) {
    const response = await api.post('/api/map/admin/geocode', { address });
    return response.data;
  },

  async reverseGeocode(lat, lng) {
    const response = await api.post('/api/map/admin/reverse-geocode', {
      lat,
      lng,
    });
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/api/map/admin/stats');
    return response.data;
  },
};

export default mapService;