import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    // profileData: { name, email, phone, address, date_of_birth }
    const response = await api.post('/me/update', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    // passwordData: { current_password, password, password_confirmation }
    const response = await api.post('/me/change-password', passwordData);
    return response.data;
  }
};