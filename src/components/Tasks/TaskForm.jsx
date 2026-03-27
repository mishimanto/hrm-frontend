import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const TaskForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    department_id: '',
    priority: 'medium',
    due_date: '',
    attachment: null
  });
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  
  // ✅ REMOVE THIS LINE: const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
    fetchFormData();
  }, [initialData]);

  const fetchFormData = async () => {
    try {
      const departmentsRes = await api.get('/departments');
      setDepartments(departmentsRes.data.data || departmentsRes.data);
      
      if (formData.department_id) {
        await fetchEmployeesByDepartment(formData.department_id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    }
  };

  const fetchEmployeesByDepartment = async (departmentId) => {
    try {
      const response = await api.get(`/departments/${departmentId}/employees`);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setFilteredEmployees([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'department_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        assigned_to: '' // Reset employee when department changes
      }));
      
      if (value) {
        fetchEmployeesByDepartment(value);
      } else {
        setFilteredEmployees([]);
      }
    } else if (name === 'attachment') {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        attachment: file
      }));
      
      // Show file preview
      if (file) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setFilePreview({ type: 'image', url: e.target.result });
          reader.readAsDataURL(file);
        } else {
          setFilePreview({ type: 'file', name: file.name });
        }
      } else {
        setFilePreview(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ✅ FIXED: handleSubmit - Single attachment system
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = new FormData();
    
    // Add form fields
    submitData.append('title', formData.title);
    submitData.append('description', formData.description || '');
    submitData.append('assigned_to', formData.assigned_to);
    submitData.append('department_id', formData.department_id || '');
    submitData.append('priority', formData.priority);
    submitData.append('due_date', formData.due_date);

    // ✅ SINGLE ATTACHMENT - Use 'attachment' (not 'attachments[]')
    if (formData.attachment) {
      submitData.append('attachment', formData.attachment);
    }

    console.log('FormData contents:');
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    try {
      await onSubmit(submitData);
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        assigned_to: '',
        department_id: '',
        priority: 'medium',
        due_date: '',
        attachment: null
      });
      setFilePreview(null);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
    setFilePreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <select
                  name="assigned_to"
                  value={formData.assigned_to}
                  onChange={handleChange}
                  required
                  disabled={!formData.department_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">
                    {formData.department_id ? 'Select Employee' : 'Select department first'}
                  </option>
                  {filteredEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employee_id})
                    </option>
                  ))}
                </select>
                {!formData.department_id && (
                  <p className="text-xs text-gray-500 mt-1">Please select a department first</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* File Attachment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, JPG, PNG, TXT, DOC, DOCX (Max 10MB)
                </p>
                
                {/* File Preview */}
                {filePreview && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      {filePreview.type === 'image' ? (
                        <>
                          <img src={filePreview.url} alt="Preview" className="w-12 h-12 object-cover rounded" />
                          <span className="text-sm text-gray-600">Image preview</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 text-lg">📎</span>
                          </div>
                          <span className="text-sm text-gray-600">{filePreview.name}</span>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : (initialData ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;