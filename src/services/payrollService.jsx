import api from './api';

export const payrollService = {
  getAll: (params = {}) => api.get('/payrolls', { params }),
  getById: (id) => api.get(`/payrolls/${id}`),
  create: (data) => api.post('/payrolls', data),
  update: (id, data) => api.put(`/payrolls/${id}`, data),
  delete: (id) => api.delete(`/payrolls/${id}`),
  getMyPayrolls: () => api.get('/my-payrolls'),
  getPayrollSummary: (params) => api.get('/payrolls/summary', { params }),
};