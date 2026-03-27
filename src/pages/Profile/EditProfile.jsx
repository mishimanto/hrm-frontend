import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const EditProfile = () => {
  const { user, refreshUser } = useAuth(); // I'll show below how to add refreshUser in AuthContext
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.slice(0,10) : ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authService.updateProfile(form);
      // refresh context user so header and other UIs update
      if (refreshUser) await refreshUser();
      // or if context exposes setUser: setUser(res.user)
      alert(res.message || 'Profile updated');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm">Date of birth</label>
          <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary-600 text-white rounded disabled:opacity-50">
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
