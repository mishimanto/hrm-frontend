import api from './api';

export const leaveService = {
  getAll: (params = {}) => api.get('/leaves', { params }),
  getById: (id) => api.get(`/leaves/${id}`),
  create: (data) => api.post('/leaves', data),
  updateStatus: (id, data) => api.patch(`/leaves/${id}/status`, data),
  delete: (id) => api.delete(`/leaves/${id}`),
  getMyLeaves: () => api.get('/my-leaves'),
};