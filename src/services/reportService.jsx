import api from './api';

export const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
  getEmployeeStats: () => api.get('/reports/employee-stats'),
  getAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  getLeaveReport: (params) => api.get('/reports/leaves', { params }),
  getPayrollReport: (params) => api.get('/reports/payroll', { params }),
};