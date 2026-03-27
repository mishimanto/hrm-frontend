import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { reportService } from '../../services/reportService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [dashboardStats, setDashboardStats] = useState({});
  const [employeeStats, setEmployeeStats] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [leaveData, setLeaveData] = useState({});
  const [payrollData, setPayrollData] = useState({});
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    try {
      const [dashboard, employees, attendance, leaves, payroll] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getEmployeeStats(),
        reportService.getAttendanceReport(dateRange),
        reportService.getLeaveReport(dateRange),
        reportService.getPayrollReport({ year: new Date().getFullYear() }),
      ]);

      setDashboardStats(dashboard.data);
      setEmployeeStats(employees.data);
      setAttendanceData(attendance.data);
      setLeaveData(leaves.data);
      setPayrollData(payroll.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Department Chart Data
  const departmentChartData = {
    labels: employeeStats.department_stats?.map(dept => dept.name) || [],
    datasets: [
      {
        label: 'Employees per Department',
        data: employeeStats.department_stats?.map(dept => dept.employee_count) || [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#EC4899'
        ],
      },
    ],
  };

  // Attendance Status Chart
  const attendanceStatusData = {
    labels: attendanceData.status_breakdown ? Object.keys(attendanceData.status_breakdown) : [],
    datasets: [
      {
        label: 'Attendance Status',
        data: attendanceData.status_breakdown ? Object.values(attendanceData.status_breakdown) : [],
        backgroundColor: [
          '#10B981', // Present - Green
          '#EF4444', // Absent - Red
          '#F59E0B', // Late - Yellow
          '#3B82F6', // Half Day - Blue
        ],
      },
    ],
  };

  // Leave Type Chart
  const leaveTypeData = {
    labels: leaveData.type_breakdown ? Object.keys(leaveData.type_breakdown) : [],
    datasets: [
      {
        label: 'Leave Types',
        data: leaveData.type_breakdown ? Object.values(leaveData.type_breakdown) : [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16'
        ],
      },
    ],
  };

  // Payroll Trend Chart
  const payrollTrendData = {
    labels: payrollData.monthly_trend?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Total Payroll Amount',
        data: payrollData.monthly_trend?.map(item => item.total_amount) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
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
        {/* <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1> */}
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.start_date}
            onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="date"
            value={dateRange.end_date}
            onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.total_employees}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Employees</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.active_employees}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">L</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Leaves</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardStats.pending_leaves}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Payroll</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${payrollData.total_payroll_amount?.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Distribution</h3>
          <div className="h-80">
            <Bar 
              data={departmentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Attendance Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Status</h3>
          <div className="h-80">
            <Doughnut 
              data={attendanceStatusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Leave Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Types Distribution</h3>
          <div className="h-80">
            <Pie 
              data={leaveTypeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Payroll Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payroll Trend</h3>
          <div className="h-80">
            <Line 
              data={payrollTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;