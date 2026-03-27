import React, { useState, useEffect } from 'react';
import { bulkService } from '../../services/bulkService';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

const BulkAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchEmployeesForBulk();
    }
  }, [selectedDate, selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchEmployeesForBulk = async () => {
    setLoading(true);
    try {
      const params = { date: selectedDate };
      if (selectedDepartment) {
        params.department_id = selectedDepartment;
      }
      
      const response = await bulkService.getEmployeesForBulkAttendance(params);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (employeeId, status) => {
    setEmployees(prev => prev.map(emp => 
      emp.employee_id === employeeId 
        ? { ...emp, status, check_in: status === 'present' ? '09:00' : null, check_out: status === 'present' ? '17:00' : null }
        : emp
    ));
  };

  const handleTimeChange = (employeeId, field, value) => {
    setEmployees(prev => prev.map(emp => 
      emp.employee_id === employeeId ? { ...emp, [field]: value } : emp
    ));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const attendances = employees.map(emp => ({
        employee_id: emp.employee_id,
        status: emp.status || 'absent',
        check_in: emp.check_in,
        check_out: emp.check_out,
      }));

      await bulkService.bulkAttendance({
        date: selectedDate,
        attendances,
      });

      alert('Bulk attendance saved successfully!');
      fetchEmployeesForBulk();
    } catch (error) {
      console.error('Error saving bulk attendance:', error);
      alert('Error saving bulk attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAllAsPresent = () => {
    setEmployees(prev => prev.map(emp => ({
      ...emp,
      status: 'present',
      check_in: '09:00',
      check_out: '17:00',
    })));
  };

  const markAllAsAbsent = () => {
    setEmployees(prev => prev.map(emp => ({
      ...emp,
      status: 'absent',
      check_in: null,
      check_out: null,
    })));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bulk Attendance</h1>
      </div> */}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={markAllAsPresent}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mark All Present
            </button>
            <button
              onClick={markAllAsAbsent}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                New Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.employee_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.employee_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.employee_code}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.current_status === 'present' ? 'bg-green-100 text-green-800' :
                    employee.current_status === 'absent' ? 'bg-red-100 text-red-800' :
                    employee.current_status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.current_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={employee.status || ''}
                    onChange={(e) => handleStatusChange(employee.employee_id, e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={employee.check_in || ''}
                    onChange={(e) => handleTimeChange(employee.employee_id, 'check_in', e.target.value)}
                    disabled={!employee.status || employee.status !== 'present'}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="time"
                    value={employee.check_out || ''}
                    onChange={(e) => handleTimeChange(employee.employee_id, 'check_out', e.target.value)}
                    disabled={!employee.status || employee.status !== 'present'}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Bulk Attendance'}
        </button>
      </div>
    </div>
  );
};

export default BulkAttendance;