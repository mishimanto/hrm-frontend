import React, { useState, useRef, useEffect } from 'react';
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <>
      {/* Inline CSS animations */}
      <style>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.18s ease-out;
        }
        .rotate-icon {
          transition: transform 0.25s ease;
        }
        .rotate-icon.open {
          transform: rotate(180deg);
        }
      `}</style>

      <header className="relative z-10 flex h-16 items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Sidebar Toggle (Mobile) */}
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {/* Welcome Message */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Welcome back, <span className="text-primary-600">{user?.name}</span>!
        </h1>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-50 transition-all"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
              alt="User Avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              {user?.name}
            </span>
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-500 rotate-icon ${dropdownOpen ? 'open' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white/80 backdrop-blur-lg border border-gray-100 rounded-2xl shadow-xl 
                         ring-1 ring-black/5 py-2 animate-slide-in"
            >
              <Link
                to="/profile/edit"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mx-1"
                onClick={() => setDropdownOpen(false)}
              >
                Edit Profile
              </Link>
              <Link
                to="/profile/change-password"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg mx-1"
                onClick={() => setDropdownOpen(false)}
              >
                Change Password
              </Link>
              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-1"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
