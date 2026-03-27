import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { payrollService } from '../../services/payrollService';
import { employeeService } from '../../services/employeeService';
import { PlusIcon } from '@heroicons/react/24/outline';

const Payrolls = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    pay_period: 'monthly',
    pay_date: new Date().toISOString().split('T')[0],
    basic_salary: '',
    house_allowance: '',
    transport_allowance: '',
    bonus: '',
    overtime_pay: '',
    tax_deduction: '',
    other_deductions: '',
  });

  // Helper functions to check user role
  const isAdmin = () => user?.role?.slug === 'admin';
  const isHR = () => user?.role?.slug === 'hr';
  const isEmployee = () => user?.role?.slug === 'employee';

  useEffect(() => {
    fetchPayrolls();
    if (isAdmin() || isHR()) {
      fetchEmployees();
    }
  }, [user]);

  const fetchPayrolls = async () => {
    try {
      let response;
      if (isAdmin() || isHR()) {
        response = await payrollService.getAll();
      } else {
        response = await payrollService.getMyPayrolls();
      }
      setPayrolls(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
      setPayrolls([]);
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
    try {
      await payrollService.create(formData);
      setShowModal(false);
      setFormData({
        employee_id: '',
        pay_period: 'monthly',
        pay_date: new Date().toISOString().split('T')[0],
        basic_salary: '',
        house_allowance: '',
        transport_allowance: '',
        bonus: '',
        overtime_pay: '',
        tax_deduction: '',
        other_deductions: '',
      });
      fetchPayrolls();
    } catch (error) {
      console.error('Error creating payroll:', error);
      alert('Error creating payroll');
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basic_salary) || 0;
    const house = parseFloat(formData.house_allowance) || 0;
    const transport = parseFloat(formData.transport_allowance) || 0;
    const bonus = parseFloat(formData.bonus) || 0;
    const overtime = parseFloat(formData.overtime_pay) || 0;
    const tax = parseFloat(formData.tax_deduction) || 0;
    const other = parseFloat(formData.other_deductions) || 0;

    const gross = basic + house + transport + bonus + overtime;
    const deductions = tax + other;
    return gross - deductions;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'processed': return 'text-blue-600 bg-blue-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
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
        {(isAdmin() || isHR()) && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Payroll
          </button>
        )}
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {(isAdmin() || isHR()) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Pay Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Allowances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Net Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrolls.length === 0 ? (
                <tr>
                  <td 
                    colSpan={(isAdmin() || isHR()) ? 8 : 7} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No payroll records found
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    {(isAdmin() || isHR()) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payroll.employee?.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payroll.employee?.user?.employee_id || 'N/A'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {payroll.pay_period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payroll.pay_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${payroll.basic_salary?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {parseFloat(payroll.house_allowance) > 0 && (
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-600">House:</span>
                            <span className="font-medium">${parseFloat(payroll.house_allowance || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {parseFloat(payroll.transport_allowance) > 0 && (
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-600">Transport:</span>
                            <span className="font-medium">${parseFloat(payroll.transport_allowance || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {parseFloat(payroll.bonus) > 0 && (
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-600">Bonus:</span>
                            <span className="font-medium">${parseFloat(payroll.bonus || 0).toLocaleString()}</span>
                          </div>
                        )}
                        {parseFloat(payroll.overtime_pay) > 0 && (
                          <div className="flex justify-between space-x-4">
                            <span className="text-gray-600">Overtime:</span>
                            <span className="font-medium">${parseFloat(payroll.overtime_pay || 0).toLocaleString()}</span>
                          </div>
                        )}
                        
                        {(parseFloat(payroll.house_allowance) > 0 || parseFloat(payroll.transport_allowance) > 0 || parseFloat(payroll.bonus) > 0 || parseFloat(payroll.overtime_pay) > 0) && (
                          <div className="border-t pt-1 mt-1">
                            <div className="flex justify-between space-x-4 font-semibold">
                              <span className="text-gray-800">Total:</span>
                              <span className="text-green-600">
                                ${(
                                  parseFloat(payroll.house_allowance || 0) + 
                                  parseFloat(payroll.transport_allowance || 0) + 
                                  parseFloat(payroll.bonus || 0) + 
                                  parseFloat(payroll.overtime_pay || 0)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {parseFloat(payroll.house_allowance || 0) === 0 && parseFloat(payroll.transport_allowance || 0) === 0 && parseFloat(payroll.bonus || 0) === 0 && parseFloat(payroll.overtime_pay || 0) === 0 && (
                          <span className="text-gray-400">No allowances</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(
                        (payroll.tax_deduction || 0) + 
                        (payroll.other_deductions || 0)
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payroll.net_salary?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payroll Modal - Your Original Code */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center">Create Payroll</h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
                        {employee.user?.name} - ${employee.salary}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pay Period</label>
                  <select
                    required
                    value={formData.pay_period}
                    onChange={(e) => setFormData({ ...formData, pay_period: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pay Date</label>
                  <input
                    type="date"
                    required
                    value={formData.pay_date}
                    onChange={(e) => setFormData({ ...formData, pay_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">House Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.house_allowance}
                      onChange={(e) => setFormData({ ...formData, house_allowance: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transport Allowance</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.transport_allowance}
                      onChange={(e) => setFormData({ ...formData, transport_allowance: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bonus</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bonus}
                      onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Overtime Pay</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.overtime_pay}
                      onChange={(e) => setFormData({ ...formData, overtime_pay: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Deduction</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.tax_deduction}
                      onChange={(e) => setFormData({ ...formData, tax_deduction: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Other Deductions</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.other_deductions}
                      onChange={(e) => setFormData({ ...formData, other_deductions: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Net Salary:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${calculateNetSalary().toFixed(2)}
                    </span>
                  </div>
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
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Payrolls;