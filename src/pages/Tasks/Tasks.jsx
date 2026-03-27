import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import TaskCard from '../../components/Tasks/TaskCard';
import TaskForm from '../../components/Tasks/TaskForm';
import TaskFilters from '../../components/Tasks/TaskFilters';
import TaskStats from '../../components/Tasks/TaskStats';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    department_id: 'all'
  });

  const canCreateTask = [1, 2, 3].includes(user?.role_id); // Admin, HR, Manager
  const isEmployee = user?.role_id === 4; // Employee

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      
      // Employee না হলে department filter add করবে
      if (!isEmployee && filters.department_id !== 'all') {
        params.append('department_id', filters.department_id);
      }
      
      const response = await api.get(`/tasks?${params}`);
      setTasks(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Departments fetch করুন
  const fetchDepartments = async () => {
    try {
      // Employee হলে departments fetch করবে না
      if (isEmployee) {
        setDepartments([]);
        return;
      }

      console.log('Fetching departments...');
      const response = await api.get('/departments');
      console.log('Departments response:', response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      
      // Error হলে fallback empty array set করুন
      setDepartments([]);
      
      // Debugging এর জন্য error details log করুন
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [user]); // user change হলে re-fetch করবে

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Submitting task data:', taskData);
      
      // Check if it's FormData (with attachments)
      if (taskData instanceof FormData) {
        console.log('Sending as FormData with attachments');
        
        // Debug: Show what's in FormData
        for (let pair of taskData.entries()) {
          console.log(pair[0] + ': ', pair[1]);
        }
        
        const response = await api.post('/tasks', taskData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setShowForm(false);
        fetchTasks();
        return response;
      } else {
        // Regular JSON data
        console.log('Sending as JSON data');
        const response = await api.post('/tasks', taskData);
        setShowForm(false);
        fetchTasks();
        return response;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await api.put(`/tasks/${taskId}`, updates);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900"></h1>
          <p className="text-gray-600"></p>
        </div>
        {canCreateTask && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Task
          </button>
        )}
      </div>

      <TaskStats />

      <TaskFilters 
        filters={filters} 
        onFilterChange={setFilters} 
        departments={departments}
        userRole={user?.role_id}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {canCreateTask 
                ? 'Get started by creating your first task' 
                : 'No tasks have been assigned to you yet'
              }
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onUpdate={handleUpdateTask}
              canEdit={canCreateTask || task.assigned_to === user?.employee?.id}
            />
          ))
        )}
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Tasks;