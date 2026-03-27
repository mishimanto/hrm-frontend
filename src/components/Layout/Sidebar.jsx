import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

// Role-based navigation configuration
const getNavigation = (userRole) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Attendance', href: '/attendances', icon: CalendarIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Leaves', href: '/leaves', icon: DocumentTextIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Payroll', href: '/payrolls', icon: CurrencyDollarIcon, roles: ['admin', 'hr', 'manager', 'employee'] },
  ];

  const adminHrNavigation = [
    { name: 'Employees', href: '/employees', icon: UsersIcon, roles: ['admin', 'hr'] },
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, roles: ['admin', 'hr'] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['admin', 'hr', 'manager'] },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon, roles: ['admin', 'hr', 'manager'] },
    { name: 'Bulk Operations', href: '/bulk-attendance', icon: ClipboardDocumentListIcon, roles: ['admin', 'hr'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = [
    ...baseNavigation.filter(item => item.roles.includes(userRole)),
    ...adminHrNavigation.filter(item => item.roles.includes(userRole))
  ];

  return filteredNavigation;
};

// Alternative: Simple role-based navigation
const getNavigationByRoleId = (roleId) => {
  // Role IDs: 1=admin, 2=hr, 3=manager, 4=employee
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: [1, 2, 3, 4] },
    { name: 'Employees', href: '/employees', icon: UsersIcon, roles: [1, 2] },
    { name: 'Attendance', href: '/attendances', icon: CalendarIcon, roles: [1, 2, 3, 4] },
    { name: 'Leaves', href: '/leaves', icon: DocumentTextIcon, roles: [1, 2, 3, 4] },
    { name: 'Payroll', href: '/payrolls', icon: CurrencyDollarIcon, roles: [1, 2, 3, 4] },
    { name: 'Departments', href: '/departments', icon: BuildingOfficeIcon, roles: [1, 2] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: [1, 2, 3] },
    { name: 'Calendar', href: '/calendar', icon: CalendarDaysIcon, roles: [1, 2, 3, 4] },
    { name: 'Bulk Operations', href: '/bulk-attendance', icon: ClipboardDocumentListIcon, roles: [1, 2] },
    { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, roles: [1, 2, 3] },
    { name: 'My Tasks', href: '/my-tasks', icon: ClipboardDocumentListIcon, roles: [4] },
  ];

  return allNavigation.filter(item => item.roles.includes(roleId));
};

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Get navigation based on user role
  const navigation = user?.role_id
  ? getNavigationByRoleId(Number(user.role_id)) // 🔥 FIX
  : getNavigation("employee");
  
  // Get role name for display
  const getRoleName = () => {
    if (user?.role?.name) return user.role.name;
    
    // Fallback based on role_id
    const roleNames = {
      1: 'Administrator',
      2: 'HR Manager', 
      3: 'Manager',
      4: 'Employee'
    };
    return roleNames[user?.role_id] || 'Employee';
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${open ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" onClick={() => setOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile Content with Fixed Height */}
            <div className="flex flex-col h-full">
              {/* Header - Fixed */}
              <div className="flex-shrink-0 pt-5 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">HR</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">HRM System</h1>
                    <p className="text-xs text-gray-500 mt-1">Human Resources</p>
                  </div>
                </div>
              </div>

              {/* Navigation - Scrollable */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                        }`
                      }
                      onClick={() => setOpen(false)}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                          location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>

              {/* User Profile - Fixed at Bottom */}
              <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize truncate">
                      {getRoleName()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 h-screen">
          <div className="flex flex-col h-full bg-white border-r border-gray-200">
            
            {/* Header - Fixed */}
            <div className="flex-shrink-0 p-4 px-6">
              <div className="flex items-center justify-center">
                {/* Logo Option 1: Centered Text */}
                {/* <div className="text-center">
                  <h1 className="text-xl font-bold text-gray-900">HRM </h1>
                </div> */}
                
                {/* Logo Option 2: Image Logo - uncomment to use */}
                
                <img 
  src="/1.png"
  alt="HRM Logo"
  className="h-10 w-30 object-contain"
/>

               
                
                {/* Logo Option 3: SVG Icon with Text */}
                {/* 
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-bold text-gray-900">HRM</h1>
                  <p className="text-xs text-gray-500 text-center">Human Resources<br/>Management</p>
                </div>
                */}
              </div>
            </div>

            {/* Navigation - Scrollable */}
            <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
              <nav className="px-4 space-y-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                      }`
                    }
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${
                        location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* User Profile - Fixed at Bottom */}
            {/* <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {getRoleName()}
                  </p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles using global CSS or inline styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>
    </>
  );
};

export default Sidebar;
