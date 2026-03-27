import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { CalendarIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const MyAttendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchMyAttendance();
    fetchTodayAttendance();
  }, [selectedMonth]);

  const fetchMyAttendance = async () => {
    try {
      const response = await attendanceService.myAttendance({ month: selectedMonth });
      setAttendances(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await attendanceService.myAttendance({ date: today });
      if (response.data.length > 0) {
        setTodayAttendance(response.data[0]);
      } else {
        setTodayAttendance(null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await attendanceService.myCheckIn({});
      fetchTodayAttendance();
      fetchMyAttendance();
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Check-in failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.myCheckOut({});
      fetchTodayAttendance();
      fetchMyAttendance();
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Check-out failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'half_day': return 'text-blue-600 bg-blue-100';
      case 'checked': return 'text-purple-600 bg-purple-100';
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
      {/* Today's Attendance Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Check In</div>
            <div className="text-xl font-semibold mt-2">
              {todayAttendance?.check_in || 'Not checked in'}
            </div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Check Out</div>
            <div className="text-xl font-semibold mt-2">
              {todayAttendance?.check_out || 'Not checked out'}
            </div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-xl font-semibold mt-2 capitalize">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(todayAttendance?.status)}`}>
                {todayAttendance?.status || 'Not marked'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {!todayAttendance?.check_in ? (
            <button
              onClick={handleCheckIn}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Check In
            </button>
          ) : !todayAttendance?.check_out ? (
            <button
              onClick={handleCheckOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Check Out
            </button>
          ) : (
            <div className="text-green-600 font-semibold">
              <CheckCircleIcon className="h-5 w-5 inline mr-2" />
              Attendance Completed for Today
            </div>
          )}
        </div>
      </div>

      {/* Monthly Attendance History */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Monthly Attendance History</h2>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(attendance.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.check_in || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.check_out || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.total_hours ? `${attendance.total_hours} hrs` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(attendance.status)}`}>
                      {attendance.status === 'checked' ? 'Completed' : attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })} Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {attendances.filter(a => a.status === 'present').length}
            </div>
            <div className="text-sm text-green-800">Present</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {attendances.filter(a => a.status === 'absent').length}
            </div>
            <div className="text-sm text-red-800">Absent</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {attendances.filter(a => a.status === 'late').length}
            </div>
            <div className="text-sm text-yellow-800">Late</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {attendances.filter(a => a.status === 'half_day').length}
            </div>
            <div className="text-sm text-blue-800">Half Day</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {attendances.filter(a => a.status === 'checked').length}
            </div>
            <div className="text-sm text-purple-800">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;