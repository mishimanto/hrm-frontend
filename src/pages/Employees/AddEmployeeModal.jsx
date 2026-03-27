import React, { useState, useEffect } from 'react';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';
import { positionService } from '../../services/positionService';
import { roleService } from '../../services/roleService';
import { XMarkIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const AddEmployeeModal = ({ show, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    department_id: '',
    position_id: '',
    salary: '',
    employment_type: 'full-time',
    joining_date: '',
    role_id: '4',
    password: '',
    confirm_password: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    if (show) {
      fetchDepartments();
      fetchPositions();
      fetchRoles();
      resetForm();
    }
  }, [show]);

  useEffect(() => {
    if (formData.department_id) {
      const departmentPositions = positions.filter(
        position => position.department_id === parseInt(formData.department_id)
      );
      setFilteredPositions(departmentPositions);
      setFormData(prev => ({ ...prev, position_id: '' }));
    } else {
      setFilteredPositions([]);
      setFormData(prev => ({ ...prev, position_id: '' }));
    }
  }, [formData.department_id, positions]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentService.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showToast('Failed to fetch departments', 'error');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await positionService.getAll();
      setPositions(response.data);
    } catch (error) {
      console.error('Error fetching positions:', error);
      showToast('Failed to fetch positions', 'error');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleService.getAll();
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showToast('Failed to fetch roles', 'error');
      setRoles([
        { id: 1, name: 'Administrator', slug: 'admin' },
        { id: 2, name: 'HR Manager', slug: 'hr' },
        { id: 3, name: 'Department Manager', slug: 'manager' },
        { id: 4, name: 'Employee', slug: 'employee' },
      ]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      employee_id: '',
      department_id: '',
      position_id: '',
      salary: '',
      employment_type: 'full-time',
      joining_date: '',
      role_id: '',
      password: '',
      confirm_password: '',
    });
    setFilteredPositions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirm_password) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password && formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (!formData.role_id) {
      showToast('Please select a role', 'error');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        employee_id: formData.employee_id,
        department_id: formData.department_id || null,
        position_id: formData.position_id || null,
        salary: parseFloat(formData.salary),
        employment_type: formData.employment_type,
        joining_date: formData.joining_date,
        role_id: formData.role_id,
        password: formData.password || undefined,
      };

      await employeeService.create(submitData);
      showToast('Employee created successfully!', 'success');
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating employee:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating employee';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      department_id: departmentId,
      position_id: ''
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md transition-opacity duration-300 ease-out"></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-100 opacity-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-t-3xl py-3 px-8 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-x-12 translate-y-12"></div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Add New Employee</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-2xl transition-all duration-200 transform hover:scale-110 hover:rotate-90 group"
              >
                <XMarkIcon className="h-6 w-6 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toast.show && (
            <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out ${
              toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              <div className={`flex items-center p-4 rounded-2xl shadow-lg border-l-4 ${
                toast.type === 'success' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              } min-w-80 max-w-md`}>
                <div className={`flex-shrink-0 ${
                  toast.type === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {toast.type === 'success' ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <XCircleIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
              
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Full Name *"
                      />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Email Address *"
                      />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Phone Number *"
                      />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="text"
                        required
                        value={formData.employee_id}
                        onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Employee ID *"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Login Credentials */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Role & Login Credentials</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <select
                        required
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        <option value="">Select Role *</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Password (Optional)"
                        minLength="8"
                      />
                      <p className="text-xs text-gray-500">
                        Minimum 8 characters. If empty, system will generate a password.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <input
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white"
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                    <h4 className="text-lg font-semibold text-gray-900">Employment Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <select
                        value={formData.department_id}
                        onChange={handleDepartmentChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <select
                        value={formData.position_id}
                        onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                        disabled={!formData.department_id}
                        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white ${
                          !formData.department_id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">
                          {formData.department_id ? 'Select Position' : 'First select a department'}
                        </option>
                        {filteredPositions.map((position) => (
                          <option key={position.id} value={position.id}>
                            {position.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3">
                      <select
                        value={formData.employment_type}
                        onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.salary}
                          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                          placeholder="Salary *"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                      <input
                        type="date"
                        required
                        value={formData.joining_date}
                        onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4" />
                      <span>Create Employee</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;