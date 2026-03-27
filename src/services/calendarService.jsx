import api from './api';

export const calendarService = {
  getEvents: (params = {}) => api.get('/calendar/events', { params }),
  getMyEvents: (params = {}) => api.get('/calendar/my-events', { params }),
};