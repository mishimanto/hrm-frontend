import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const TaskStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all tasks and calculate stats on frontend
      let tasks = [];
      
      // Use appropriate endpoint based on user role
      if (user?.role_id === 4) { // Employee
        const response = await api.get('/my-tasks');
        tasks = response.data.data || response.data;
      } else { // Admin/HR/Manager
        const response = await api.get('/tasks');
        tasks = response.data.data || response.data;
      }
      
      const now = new Date();
      const calculatedStats = {
        total: tasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        in_progress: tasks.filter(task => task.status === 'in_progress').length,
        review: tasks.filter(task => task.status === 'review').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        overdue: tasks.filter(task => {
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate < now && !['completed', 'cancelled'].includes(task.status);
        }).length,
      };
      
      setStats(calculatedStats);
      
    } catch (error) {
      console.error('Error fetching task stats:', error);
      setError('Failed to load task statistics');
      // Set default empty stats
      setStats({
        total: 0,
        pending: 0,
        in_progress: 0,
        review: 0,
        completed: 0,
        overdue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg p-4 animate-pulse h-20"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-yellow-600 mr-3">⚠️</div>
          <div>
            <p className="text-yellow-800 font-medium">{error}</p>
            <button
              onClick={fetchStats}
              className="text-yellow-700 underline text-sm mt-1 hover:text-yellow-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      color: 'border-blue-500',
      bgColor: 'bg-blue-50',
      icon: '📋',
      description: 'All tasks'
    },
    {
      label: 'Pending',
      value: stats.pending,
      color: 'border-yellow-500',
      bgColor: 'bg-yellow-50',
      icon: '⏳',
      description: 'Waiting to start'
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      color: 'border-purple-500',
      bgColor: 'bg-purple-50',
      icon: '🚀',
      description: 'Currently working'
    },
    {
      label: 'Completed',
      value: stats.completed,
      color: 'border-green-500',
      bgColor: 'bg-green-50',
      icon: '✅',
      description: 'Finished tasks'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      color: 'border-red-500',
      bgColor: 'bg-red-50',
      icon: '⚠️',
      description: 'Past due date'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className={`rounded-lg shadow p-4 border-l-4 ${stat.color} ${stat.bgColor} hover:shadow-md transition-shadow cursor-default`}
          title={stat.description}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <span className="text-2xl" role="img" aria-label={stat.label}>{stat.icon}</span>
          </div>
          {stat.description && (
            <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskStats;