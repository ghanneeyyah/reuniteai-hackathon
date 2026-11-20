// src/services/notification.service.js
import api from './api';

const notificationService = {
  async getAll(limit = 30) {
    const response = await api.get('/api/notifications', { params: { limit } });
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/api/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;