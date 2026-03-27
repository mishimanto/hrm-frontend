import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import {
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

// Chart.js imports
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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

// Clock Component
const DigitalClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getWeatherIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 18) {
      return <SunIcon className="h-8 w-8 text-yellow-500" />;
    } else {
      return <MoonIcon className="h-8 w-8 text-blue-400" />;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {getWeatherIcon()}
        <div>
          <div className="text-4xl font-bold text-white">
            {formatTime(currentTime)}
          </div>
          <div className="text-primary-100 text-lg">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-white">
          {getGreeting()}
        </div>
        <div className="text-primary-100">
          Have a productive day!
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
  <div 
    className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    onClick={onClick}
  >
    <div className="p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color.replace('text', 'text')}`} />
        </div>
        <div className="ml-4">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="text-2xl font-bold text-gray-900">{value}</dd>
          {subtitle && (
            <dd className="text-xs text-gray-400 mt-1">{subtitle}</dd>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
    <div className="flex items-center space-x-3">
      <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
        activity.status === 'approved' ? 'bg-green-500' :
        activity.status === 'rejected' ? 'bg-red-500' :
        activity.status === 'pending' ? 'bg-yellow-500' :
        'bg-blue-500'
      }`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 truncate">{activity.type}</p>
        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
  </div>
);

const TaskItem = ({ task }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
      <div className="flex items-center space-x-3 mt-1">
        <span className={`text-xs px-2 py-1 rounded-full ${
          task.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {task.priority}
        </span>
        <span className="text-xs text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
      </div>
    </div>
    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
      task.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
      'bg-gray-100 text-gray-800 border border-gray-200'
    }`}>
      {task.status?.replace('_', ' ') || 'pending'}
    </span>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({});
  const [payrollTrend, setPayrollTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role checking functions based on your database
  const isAdmin = () => user?.role_id === 1;
  const isHR = () => user?.role_id === 2;
  const isManager = () => user?.role_id === 3;
  const isEmployee = () => user?.role_id === 4;

  // Check if user can view all data (admin/hr/manager)
  const canViewAllData = () => isAdmin() || isHR() || isManager();

  // Chart data based on real data
  const departmentChartData = {
    labels: departmentStats.map(dept => dept.name) || [],
    datasets: [
      {
        label: 'Employees per Department',
        data: departmentStats.map(dept => dept.employee_count) || [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#EC4899'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late', 'Half Day'],
    datasets: [
      {
        label: 'Today\'s Attendance',
        data: [
          attendanceStats.present || 0,
          attendanceStats.absent || 0,
          attendanceStats.late || 0,
          attendanceStats.half_day || 0
        ],
        backgroundColor: [
          '#10B981', '#EF4444', '#F59E0B', '#3B82F6'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const payrollTrendData = {
    labels: payrollTrend.map(item => item.month) || [],
    datasets: [
      {
        label: 'Payroll Trend',
        data: payrollTrend.map(item => item.total_amount) || [],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardService.getDashboardStats();
        
        if (response.data.success) {
          const data = response.data.data;
          setStats(data);
          setRecentActivities(data.recent_activities || []);
          
          if (canViewAllData()) {
            setDepartmentStats(data.department_stats || []);
            setAttendanceStats(data.attendance_stats || {});
            setPayrollTrend(data.payroll_trend || []);
          } else {
            setUpcomingTasks(data.upcoming_tasks || []);
          }
        } else {
          throw new Error(response.data.message || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-3 text-gray-500">No dashboard data available</p>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Clock Section with Gradient */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 shadow-2xl rounded-2xl p-8 text-white relative overflow-hidden">
        <DigitalClock />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white bg-opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {canViewAllData() ? (
          // Admin/HR/Manager Dashboard - Pure Dynamic Data
          <>
            <StatCard
              title="Total Employees"
              value={stats.total_employees || 0}
              subtitle="Registered in system"
              icon={UsersIcon}
              color="text-blue-600"
              onClick={() => window.location.href = '/employees'}
            />
            <StatCard
              title="Active Today"
              value={stats.today_attendance || 0}
              subtitle="Present employees"
              icon={CalendarIcon}
              color="text-green-600"
              onClick={() => window.location.href = '/attendances'}
            />
            <StatCard
              title="Pending Leaves"
              value={stats.pending_leaves || 0}
              subtitle="Awaiting approval"
              icon={ExclamationTriangleIcon}
              color="text-yellow-600"
              onClick={() => window.location.href = '/leaves'}
            />
            <StatCard
              title="Task Completion"
              value={`${stats.task_completion_rate || 0}%`}
              subtitle="This month"
              icon={CheckCircleIcon}
              color="text-purple-600"
              onClick={() => window.location.href = '/tasks'}
            />
          </>
        ) : (
          // Employee Dashboard - Pure Dynamic Data
          <>
            <StatCard
              title="Pending Leaves"
              value={stats.my_pending_leaves || 0}
              subtitle="Awaiting approval"
              icon={ExclamationTriangleIcon}
              color="text-yellow-600"
              onClick={() => window.location.href = '/leaves'}
            />
            <StatCard
              title="Task Completion"
              value={`${stats.task_completion_rate || 0}%`}
              subtitle={`${stats.completed_tasks || 0}/${stats.total_tasks || 0} tasks`}
              icon={CheckCircleIcon}
              color="text-green-600"
              onClick={() => window.location.href = '/my-tasks'}
            />
            <StatCard
              title="Work Hours"
              value={`${stats.work_hours || 0}h`}
              subtitle="This month"
              icon={ClockIcon}
              color="text-blue-600"
              onClick={() => window.location.href = '/attendances'}
            />
            <StatCard
              title="Department Rank"
              value={`#${stats.department_ranking || 0}`}
              subtitle={`of ${stats.department_size || 0}`}
              icon={ChartBarIcon}
              color="text-purple-600"
            />
          </>
        )}
      </div>

      {/* Charts and Additional Data */}
      {canViewAllData() && (
        <div className="grid grid-cols-1 gap-6">
          {/* Department Distribution Chart */}
          {departmentStats.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                Department Distribution
              </h3>
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
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Attendance Status Chart */}
          {Object.keys(attendanceStats).length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                Today's Attendance Overview
              </h3>
              <div className="h-80">
                <Doughnut 
                  data={attendanceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Payroll Trend Chart */}
          {payrollTrend.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-2" />
                Payroll Trend - {new Date().getFullYear()}
              </h3>
              <div className="h-80">
                <Line 
                  data={payrollTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toLocaleString();
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {canViewAllData() ? 'Recent Activities' : 'My Recent Activities'}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <div className="text-center py-8">
                <DocumentChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Section */}
        {canViewAllData() ? (
          // Admin/HR/Manager - Quick Stats
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Total Departments</span>
                <span className="text-lg font-bold text-primary-600">{stats.total_departments || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Active Employees</span>
                <span className="text-lg font-bold text-green-600">{stats.active_employees || 0}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">Task Completion Rate</span>
                <span className="text-lg font-bold text-blue-600">{stats.task_completion_rate || 0}%</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm font-medium text-gray-700">Monthly Payroll</span>
                <span className="text-lg font-bold text-purple-600">
                  ${(stats.total_payroll || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Employee - Upcoming Tasks
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task, index) => (
                  <TaskItem key={index} task={task} />
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming tasks</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;