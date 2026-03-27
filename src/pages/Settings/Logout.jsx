// pages/Logout.js
import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 3000);

    return () => clearTimeout(timer);
  }, [logout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Logging Out
        </h2>
        
        <p className="text-gray-600 mb-6">
          You are being logged out of your account. You will be redirected to the login page shortly.
        </p>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full animate-progress"></div>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={logout}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Logout Now
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default Logout;