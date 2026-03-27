import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TaskCard = ({ task, onUpdate, canEdit }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const isAssignedEmployee = user?.employee?.id === task.assigned_to;
  const canUpdateProgress = isAssignedEmployee && user?.role_id === 4;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const handleProgressChange = async (newProgress) => {
    try {
      if (user?.role_id !== 4) {
        alert('Only assigned employees can update progress');
        return;
      }
      
      if (!isAssignedEmployee) {
        alert('You can only update progress for tasks assigned to you');
        return;
      }
      
      setIsUpdating(true);
      await onUpdate(task.id, { progress: newProgress });
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Error updating task progress');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'review': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`bg-white rounded-xl border ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    } hover:border-blue-300 hover:shadow-2xl shadow-lg transition-all duration-300 p-5`}>
      
      {/* Header with Title and Status */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <Link 
          to={`/tasks/${task.id}`}
          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 flex-1"
        >
          {task.title}
        </Link>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(task.status)}`}>
            {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
        {task.description || 'No description provided for this task.'}
      </p>

      {/* Meta Information Row */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {task.assigned_to?.user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{task.assigned_to?.user?.name}</p>
              <p className="text-xs text-gray-500">{task.department?.name}</p>
            </div>
          </div>
        </div>
        
        <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
          <p className="font-semibold">{formatDate(task.due_date)}</p>
          <p className="text-xs">{isOverdue ? 'Overdue' : 'Due date'}</p>
        </div>
      </div>

      {/* Attachment Indicator */}
      {task.attachment_path && (
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-4 p-2 bg-blue-50 rounded-lg">
          <span className="text-lg">📎</span>
          <span className="font-medium">File attached</span>
          <span className="text-gray-400 ml-auto text-xs bg-white px-2 py-1 rounded">
            {task.attachment_path.split('.').pop()?.toUpperCase()}
          </span>
        </div>
      )}

      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Task Progress</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{task.progress}%</span>
            {!canUpdateProgress && user?.role_id !== 4 && (
              <span className="text-gray-400 text-sm" title="Only assigned employee can update progress">
                🔒
              </span>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              task.progress === 100 ? 'bg-green-500' :
              task.progress >= 75 ? 'bg-blue-500' :
              task.progress >= 50 ? 'bg-yellow-500' :
              'bg-orange-500'
            }`}
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>

        {/* Quick Progress Actions */}
        {canUpdateProgress && (
          <div className="grid grid-cols-4 gap-2 pt-2">
            {[25, 50, 75, 100].map(progress => (
              <button
                key={progress}
                onClick={() => handleProgressChange(progress)}
                disabled={isUpdating}
                className="px-2 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:scale-105"
              >
                {progress}%
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View Details Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link 
          to={`/tasks/${task.id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;