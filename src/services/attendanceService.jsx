import api from './api';

export const attendanceService = {
  getAll: (params = {}) => api.get('/attendances', { params }),
  getById: (id) => api.get(`/attendances/${id}`),
  create: (data) => api.post('/attendances', data),
  update: (id, data) => api.put(`/attendances/${id}`, data),
  
  checkIn: async (data) => {
    try {
      console.log('Sending check-in request:', data);
      const response = await api.post('/attendances/check-in', data);
      console.log('Check-in response:', response.data);
      return response;
    } catch (error) {
      console.error('Check-in service error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  checkOut: async (data) => {
    try {
      console.log('Sending check-out request:', data);
      const response = await api.post('/attendances/check-out', data);
      console.log('Check-out response:', response.data);
      return response;
    } catch (error) {
      console.error('Check-out service error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  monthlyReport: (params) => api.get('/attendances/report/monthly', { params }),
  
  // Employee specific routes
  myAttendance: (params = {}) => api.get('/attendances/my-attendance', { params }),
  myCheckIn: (data) => api.post('/attendances/my-checkin', data),
  myCheckOut: (data) => api.post('/attendances/my-checkout', data),
  myMonthlyReport: (params) => api.get('/attendances/my-report/monthly', { params }),
};