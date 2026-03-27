import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ChangePassword = () => {
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.changePassword({
        current_password: current,
        password,
        password_confirmation: passwordConfirm,
      });
      alert(res.message || 'Password changed');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Current password</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">New password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Confirm new password</label>
          <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} className="w-full border p-2 rounded" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
            {loading ? 'Changing...' : 'Change password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
