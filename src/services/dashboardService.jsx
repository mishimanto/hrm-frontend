import api from './api';

export const dashboardService = {
  getDashboardStats() {
    return api.get('/dashboard/stats');
  },
};