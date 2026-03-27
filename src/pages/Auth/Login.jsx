import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="relative bg-white/5 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">
        
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Login
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Email Field */}
          <fieldset className="relative border-2 border-white/10 rounded-xl px-4 pt-4 pb-3 focus-within:border-blue-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
            <legend className="absolute text-sm font-medium text-gray-300 -top-2.5 left-3 px-2 bg-slate-900/80 backdrop-blur-sm">
              Email Address
            </legend>
            <input
              id="email"
              type="email"
              required
              className="block w-full text-white placeholder-gray-400 focus:outline-none bg-transparent text-lg font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>

          {/* Password Field */}
          <fieldset className="relative border-2 border-white/10 rounded-xl px-4 pt-4 pb-3 focus-within:border-blue-500/50 transition-all duration-300 bg-white/5 backdrop-blur-sm">
            <legend className="absolute text-sm font-medium text-gray-300 -top-2.5 left-3 px-2 bg-slate-900/80 backdrop-blur-sm">
              Password
            </legend>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="block w-full text-white placeholder-gray-400 focus:outline-none bg-transparent text-lg font-medium pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  {/* <svg className="w-5 h-5 ml-3 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg> */}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-center text-sm text-gray-400">
            Need an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200 group inline-flex items-center"
            >
              Create account
              <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-500/30 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
    </div>
  );
};

export default Login;