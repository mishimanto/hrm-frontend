import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService } from '../../services/leaveService';
import { employeeService } from '../../services/employeeService';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';


const Leaves = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: '',
  });

  // Helper functions to check user role
  const isAdmin = () => user?.role?.slug === 'admin';
  const isHR = () => user?.role?.slug === 'hr';
  const isEmployee = () => user?.role?.slug === 'employee';
  const isManager = () => user?.role?.slug === 'manager';

  useEffect(() => {
    fetchLeaves();
    if (isAdmin() || isHR()) {
      fetchEmployees();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      let response;
      if (isAdmin() || isHR()) {
        response = await leaveService.getAll();
      } else {
        response = await leaveService.getMyLeaves();
      }
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // --- Check for overlapping leaves first ---
  const isOverlap = leaves.some(l => 
    (new Date(formData.start_date) <= new Date(l.end_date)) &&
    (new Date(formData.end_date) >= new Date(l.start_date))
  );

  if (isOverlap) {
    alert("You already have leave on this date range!");
    return; // Stop submission
  }

  try {
    // If user is employee, automatically set their employee_id
    const submitData = { ...formData };
    if (isEmployee() && user.employee?.id) {
      submitData.employee_id = user.employee.id;
    }

    await leaveService.create(submitData);
    setShowModal(false);
    setFormData({
      employee_id: '',
      leave_type: 'sick',
      start_date: '',
      end_date: '',
      reason: '',
    });
    fetchLeaves();
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const messages = error.response.data.errors;
      console.error('Validation errors:', messages);
      alert(Object.values(messages).flat().join('\n'));
    } else {
      console.error('Error creating leave:', error);
      alert('Error creating leave application');
    }
  }
};


  const handleStatusUpdate = async (leaveId, status) => {
    const actionText = status === 'approved' ? 'approve' : 'reject';
    const actionIcon = status === 'approved' ? 'question' : 'warning';

    const result = await Swal.fire({
      title: `Are you sure you want to ${actionText} this leave?`,
      icon: actionIcon,
      showCancelButton: true,
      confirmButtonText: `Yes, ${actionText} it`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        confirmButton: `bg-${status === 'approved' ? 'green' : 'red'}-600 hover:bg-${status === 'approved' ? 'green' : 'red'}-700 text-white px-4 py-2 rounded`,
        cancelButton: 'bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 me-3 rounded'
      },
      buttonsStyling: false, // important to make customClass work
    });

    if (result.isConfirmed) {
      try {
        await leaveService.updateStatus(leaveId, { status });
        fetchLeaves();

        Swal.fire({
          icon: status === 'approved' ? 'success' : 'error',
          title: status === 'approved' ? 'Approved!' : 'Rejected!',
          text: `Leave request has been ${status}.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Error updating leave status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Error updating leave status.',
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'sick': return 'text-blue-600 bg-blue-100';
      case 'casual': return 'text-purple-600 bg-purple-100';
      case 'annual': return 'text-green-600 bg-green-100';
      case 'maternity': return 'text-pink-600 bg-pink-100';
      case 'paternity': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900"></h1>
        {(isAdmin() || isHR() || isEmployee()) && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Apply for Leave
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {(isAdmin() || isHR()) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              {(isAdmin() || isHR()) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaves.length === 0 ? (
              <tr>
                <td 
                  colSpan={(isAdmin() || isHR()) ? 7 : 5} 
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id}>
                  {(isAdmin() || isHR()) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {leave.employee?.user?.name || 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getLeaveTypeColor(leave.leave_type)}`}>
                      {leave.leave_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {leave.total_days} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {leave.reason}
                  </td>
                  {(isAdmin() || isHR()) && leave.status === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(leave.id, 'approved')}
                        className="text-green-600 hover:text-green-900"
                        title="Approve Leave"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                        title="Reject Leave"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leave Application Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center">Apply for Leave</h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {(isAdmin() || isHR()) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                      required
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.user?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                  <select
                    required
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="sick">Sick Leave</option>
                    <option value="casual">Casual Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                    <option value="emergency">Emergency Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Please provide a reason for your leave..."
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;