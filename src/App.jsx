import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Employees from './pages/Employees/Employees';
import Attendances from './pages/Attendances/Attendances';
import MyAttendance from './pages/Attendances/MyAttendance';
import Leaves from './pages/Leaves/Leaves';
import Payrolls from './pages/Payrolls/Payrolls';
import Departments from './pages/Departments/Departments';
import Reports from './pages/Reports/Reports';
import Calendar from './pages/Calendar/Calendar';
import BulkAttendance from './pages/BulkOperations/BulkAttendance';
import EditProfile from './pages/Profile/EditProfile';
import ChangePassword from './pages/Profile/ChangePassword';
import Tasks from './pages/Tasks/Tasks';
import MyTasks from './pages/Tasks/MyTasks';
import TaskDetail from './pages/Tasks/TaskDetail';

// Protected Route - শুধু login check
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Role Protected Route - specific role check
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // যদি user না থাকে
  if (!user) {
    return <Navigate to="/login" />;
  }

  // যদি role restriction থাকে এবং user এর role allowed না হয়
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Admin & HR Only Routes - Employee access করতে পারবে না */}
              <Route path="employees" element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3]}> {/* Admin(1) & HR(2) */}
                  <Employees />
                </RoleProtectedRoute>
              } />
              
              <Route path="departments" element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3]}> {/* Admin & HR */}
                  <Departments />
                </RoleProtectedRoute>
              } />
              
              <Route path="reports" element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3]}> {/* Admin, HR & Manager(3) */}
                  <Reports />
                </RoleProtectedRoute>
              } />
              
              <Route path="bulk-attendance" element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3]}> {/* Admin & HR */}
                  <BulkAttendance />
                </RoleProtectedRoute>
              } />
              
              <Route path="tasks" element={
                <RoleProtectedRoute allowedRoles={[1, 2, 3]}> {/* Admin, HR & Manager */}
                  <Tasks />
                </RoleProtectedRoute>
              } />
              
              {/* Common Routes - সব role access করতে পারবে */}
              <Route path="attendances" element={<Attendances />} />
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="leaves" element={<Leaves />} />
              <Route path="payrolls" element={<Payrolls />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="profile/change-password" element={<ChangePassword />} />
              <Route path="my-tasks" element={<MyTasks />} />
              <Route path="tasks/:id" element={<TaskDetail />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;