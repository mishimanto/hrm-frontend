import api from './api';

export const bulkService = {
  bulkAttendance: (data) => api.post('/bulk/attendance', data),
  bulkLeaveStatus: (data) => api.post('/bulk/leave-status', data),
  bulkEmployeeStatus: (data) => api.post('/bulk/employee-status', data),
  getEmployeesForBulkAttendance: (params) => api.get('/bulk/employees-for-attendance', { params }),
};