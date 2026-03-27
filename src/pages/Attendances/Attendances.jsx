import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Attendances = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { user } = useAuth();

  // Check if selected date is today
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAttendances();
    fetchEmployees();
  }, [selectedDate]);

  const fetchAttendances = async () => {
    try {
      const response = await attendanceService.getAll({ date: selectedDate });
      setAttendances(response.data.data);
    } catch (error) {
      console.error('Error fetching attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCheckIn = async (employeeId) => {
    try {
      await attendanceService.checkIn({ employee_id: employeeId });
      fetchAttendances();
    } catch (error) {
      console.error('Error checking in:', error);
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      console.log('Attempting check-out for employee:', employeeId);
      await attendanceService.checkOut({ employee_id: employeeId });
      console.log('Check-out successful');
      fetchAttendances();
    } catch (error) {
      console.error('Error checking out:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 422) {
        alert('No check-in found for today. Please check in first.');
      } else if (error.response?.status === 500) {
        alert('Server error. Please try again or contact support.');
      } else {
        alert('Error checking out. Please try again.');
      }
    }
  };

  // Time format function
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    
    try {
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-BD', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }
      
      if (timeString.split(':').length === 3) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      
      if (timeString.split(':').length === 2) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  // Format total hours properly
  const formatTotalHours = (totalHours) => {
    if (!totalHours && totalHours !== 0) return '-';
    
    if (totalHours < 0) {
      return 'Invalid';
    }
    
    const totalMinutes = totalHours * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    
    if (hours === 0 && minutes === 0) {
      return '0 hrs';
    } else if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours} hrs`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'half_day': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Check if current employee is the logged in user
  const isCurrentUser = (employee) => {
    return employee.user_id === user.id;
  };

  // Check if user has admin/manager/hr privileges
  const isPrivilegedUser = () => {
    const privilegedRoles = [1, 2, 3];
    return privilegedRoles.includes(user.role_id);
  };

  // Check if user can perform actions for this employee
  const canPerformAction = (employee) => {
    return isPrivilegedUser() || isCurrentUser(employee);
  };

  // ✅ NEW: Check if check-in is allowed for this date
  const canCheckInToday = () => {
    return isToday;
  };

  // Get online status indicator
  const getOnlineStatus = (attendance) => {
    if (attendance?.check_in && !attendance?.check_out) {
      return {
        online: true,
        tooltip: `Checked in at ${formatTime(attendance.check_in)}`
      };
    }
    return {
      online: false,
      tooltip: attendance?.check_out ? `Checked out at ${formatTime(attendance.check_out)}` : 'Not checked in'
    };
  };

  // Filter employees based on user role
  const getFilteredEmployees = () => {
    if (isPrivilegedUser()) {
      return employees;
    } else {
      return employees.filter(employee => isCurrentUser(employee));
    }
  };

  const filteredEmployees = getFilteredEmployees();

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
        <div>
          {/* <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isPrivilegedUser() ? 'Manage all employee attendance' : 'View and manage your attendance'}
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Time Format: 12-hour (AM/PM)
            </span>
          </p> */}
        </div>
        <div className="flex items-center space-x-4">
          {isPrivilegedUser() && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-1"></div>
                <span>Offline</span>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {/* {!isToday && (
              <div className="flex items-center text-amber-600 text-sm">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span>View Only Mode</span>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Date Warning Banner */}
      {!isToday && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Viewing Date: {selectedDate}
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                You are viewing attendance records for a past/future date. Check-in/Check-out operations are only available for today ({new Date().toLocaleDateString()}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Status Overview - শুধুমাত্র privileged users এবং today এর জন্য */}
      {/* {isPrivilegedUser() && isToday && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Online</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter(a => a.check_in && !a.check_out).length}
                </p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter(a => a.check_in && a.check_out).length}
                </p>
              </div>
              <CheckCircleIcon className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Check-in</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.length - attendances.filter(a => a.check_in).length}
                </p>
              </div>
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendances.filter(a => a.status === 'absent').length}
                </p>
              </div>
              <XCircleIcon className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      )} */}

      {/* Attendance Summary - শুধুমাত্র privileged users এর জন্য */}
      {isPrivilegedUser() && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isToday ? "Today's Summary" : `Attendance Summary - ${selectedDate}`}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {attendances.filter(a => a.status === 'present').length}
              </div>
              <div className="text-sm text-green-800">Present</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {attendances.filter(a => a.status === 'absent').length}
              </div>
              <div className="text-sm text-red-800">Absent</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {attendances.filter(a => a.status === 'late').length}
              </div>
              <div className="text-sm text-yellow-800">Late</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {attendances.filter(a => a.status === 'half_day').length}
              </div>
              <div className="text-sm text-blue-800">Half Day</div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {isPrivilegedUser() && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEmployees.map((employee) => {
              const attendance = attendances.find(a => a.employee_id === employee.id);
              const onlineStatus = getOnlineStatus(attendance);
              
              return (
                <tr key={employee.id} className="hover:bg-gray-50">
                  {/* Online Status Indicator - শুধুমাত্র privileged users এর জন্য */}
                  {isPrivilegedUser() && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative flex justify-center">
                        <div 
                          className={`
                            w-3 h-3 rounded-full transition-all duration-300
                            ${onlineStatus.online 
                              ? 'bg-green-500 animate-pulse' 
                              : 'bg-gray-300'
                            }
                          `}
                          title={onlineStatus.tooltip}
                        ></div>
                      </div>
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.user?.name || 'N/A'}
                          </div>
                          {isCurrentUser(employee) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">You</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{employee.user?.employee_id || 'N/A'}</span>
                          {isPrivilegedUser() && employee.department?.name && (
                            <>
                              <span>•</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {employee.department.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatTime(attendance?.check_in)}
                    </div>
                    {attendance?.check_in && (
                      <div className="text-xs text-gray-500">
                        {new Date(`${selectedDate}T${attendance.check_in}`).toLocaleDateString('en-BD', {
                          weekday: 'short'
                        })}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {formatTime(attendance?.check_out)}
                    </div>
                    {attendance?.check_out && (
                      <div className="text-xs text-gray-500">
                        {new Date(`${selectedDate}T${attendance.check_out}`).toLocaleDateString('en-BD', {
                          weekday: 'short'
                        })}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      {formatTotalHours(attendance?.total_hours)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(attendance?.status)}`}>
                      {attendance?.status || 'Not marked'}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canPerformAction(employee) ? (
                      <>
                        {!attendance?.check_in && canCheckInToday() ? (
                          // ✅ Check In Button - Only show for today
                          <button
                            onClick={() => handleCheckIn(employee.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Check In
                          </button>
                        ) : !attendance?.check_in && !canCheckInToday() ? (
                          // ❌ Check In Disabled - For past/future dates
                          <button
                            disabled
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                            title="Check-in only available for today"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Check In
                          </button>
                        ) : attendance?.check_in && !attendance?.check_out && canCheckInToday() ? (
                          // ✅ Check Out Button - Only show for today
                          <button
                            onClick={() => handleCheckOut(employee.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Check Out
                          </button>
                        ) : attendance?.check_in && !attendance?.check_out && !canCheckInToday() ? (
                          // ❌ Check Out Disabled - For past/future dates
                          <button
                            disabled
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                            title="Check-out only available for today"
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Check Out
                          </button>
                        ) : (
                          // ✅ Completed Status
                          <div className="flex flex-col space-y-1">
                            <span className="text-green-600 text-xs font-medium">Completed</span>
                            <span className="text-gray-400 text-xs">
                              {formatTotalHours(attendance?.total_hours)}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs">View only</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isPrivilegedUser() 
                ? "No employees are available for attendance tracking." 
                : "No attendance record found for you."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendances;