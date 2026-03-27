import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if current user is the assigned employee
  const isAssignedEmployee = user?.employee?.id === task?.assigned_to?.id;
  
  // Only assigned employees can update status and progress
  const canUpdateTask = isAssignedEmployee && user?.role_id === 4;

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/tasks/${id}`);
      setTask(response.data);
    } catch (error) {
      console.error('Error fetching task:', error);
      setError('Failed to load task details');
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleDownloadAttachment = async () => {
    try {
      const response = await api.get(`/tasks/${id}/download-attachment`, {
        responseType: 'blob'
      });
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'attachment';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else if (task.attachment_path) {
        filename = task.attachment_path.split('/').pop();
      }
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      
      if (error.response?.status === 403) {
        alert('You are not authorized to download this attachment');
      } else if (error.response?.status === 404) {
        alert('Attachment not found');
      } else {
        alert('Error downloading attachment');
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await api.post(`/tasks/${id}/comments`, { comment });
      setComment('');
      fetchTask(); // Refresh task data
    } catch (error) {
      console.error('Error adding comment:', error);
      
      if (error.response?.status === 403) {
        alert('You are not authorized to comment on this task');
      } else if (error.response?.status === 404) {
        alert('Task not found');
      } else {
        alert('Error adding comment: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleProgressUpdate = async (newProgress) => {
    try {
      if (!canUpdateTask) {
        alert('Only assigned employees can update progress');
        return;
      }
      
      await api.put(`/tasks/${id}`, { progress: newProgress });
      fetchTask(); // Refresh task data
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Error updating task progress');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (!canUpdateTask) {
        alert('Only assigned employees can update task status');
        return;
      }

      setIsUpdating(true);
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTask(); // Refresh task data
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Error updating task status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          Back to Tasks
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">{error || 'Task not found'}</h3>
          <p className="text-red-600 mb-4">
            The task you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={fetchTask}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            ← Back to Tasks
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status?.replace('_', ' ') || 'Unknown'}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
            task.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{task.description || 'No description provided.'}</p>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Assigned To</h4>
              <p className="text-gray-900">{task.assigned_to?.user?.name || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Assigned By</h4>
              <p className="text-gray-900">{task.assigned_by?.name || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
              <p className={`${task.is_overdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                {task.is_overdue && ' (Overdue)'}
              </p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-gray-500">Progress</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{task.progress || 0}%</span>
                  {!canUpdateTask && user?.role_id !== 4 && (
                    <span className="text-xs text-gray-400" title="Only assigned employee can update progress">
                      🔒
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
              
              {/* Progress Update Buttons - ONLY for assigned employees */}
              {canUpdateTask && (
                <div className="flex space-x-2 mt-3">
                  {[25, 50, 75, 100].map(progress => (
                    <button
                      key={progress}
                      onClick={() => handleProgressUpdate(progress)}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors border border-purple-300"
                    >
                      Set {progress}%
                    </button>
                  ))}
                </div>
              )}
              
              {user?.role_id !== 4 && !canUpdateTask && (
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Progress can only be updated by the assigned employee
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status Change Section - ONLY for assigned employees */}
        {canUpdateTask && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Update Task Status</h3>
            <div className="flex flex-wrap gap-2">
              {task.status !== 'pending' && (
                <button
                  onClick={() => handleStatusChange('pending')}
                  disabled={isUpdating}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors border border-gray-300"
                >
                  ⏸️ Mark as Pending
                </button>
              )}
              {task.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 transition-colors border border-blue-300"
                >
                  🚀 Mark as In Progress
                </button>
              )}
              {task.status !== 'review' && (
                <button
                  onClick={() => handleStatusChange('review')}
                  disabled={isUpdating}
                  className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 transition-colors border border-yellow-300"
                >
                  🔍 Mark for Review
                </button>
              )}
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={isUpdating}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors border border-green-300"
                >
                  ✅ Mark as Completed
                </button>
              )}
            </div>
          </div>
        )}

        {/* Attachment Section */}
        {task.attachment_path && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Attachment</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-blue-600 text-xl">📎</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.attachment_path.split('/').pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click download to get the file
                  </p>
                </div>
              </div>
              <button
                onClick={handleDownloadAttachment}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Comments</h3>
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Comment
            </button>
          </form>

          <div className="space-y-4">
            {task.comments?.map(comment => (
              <div key={comment.id} className="border-l-4 border-blue-500 pl-4">
                <div className="flex justify-between items-start">
                  <p className="font-medium text-gray-900">{comment.user?.name || 'Unknown User'}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{comment.comment}</p>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <p className="text-gray-500 text-center py-4">No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;