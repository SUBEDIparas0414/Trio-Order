import React, { useState } from 'react';
import { GiChefToque } from "react-icons/gi";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/user/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (response.data.success && response.data.token) {
        // Store admin token
        localStorage.setItem('token', response.data.token);
        
        // Store admin info
        const adminInfo = {
          email: formData.email,
          username: formData.username,
          token: response.data.token,
          isAdmin: true
        };
        localStorage.setItem('admin', JSON.stringify(adminInfo));

        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('adminLoginData', JSON.stringify({
            email: formData.email,
            password: formData.password,
            rememberMe: true
          }));
        } else {
          localStorage.removeItem('adminLoginData');
        }

        // Navigate to admin dashboard
        navigate('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a120b] via-[#2a1e14] to-[#3e2b1d] flex items-center justify-center p-4">
      <div className="bg-[#4b3b3b]/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border-2 border-amber-500/20 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GiChefToque className="text-4xl text-amber-500" />
            <span className="text-2xl font-bold text-amber-100">Admin Panel</span>
          </div>
          <h2 className="text-xl text-amber-300">Create Admin Account</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-amber-300 mb-2">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-amber-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-amber-300 mb-2">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-amber-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 bg-[#3a2b2b]/50 border border-amber-500/20 rounded-lg text-amber-100 placeholder-amber-400/60 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-amber-600 bg-[#3a2b2b]/50 border-amber-500/20 rounded focus:ring-amber-500 focus:ring-2"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-amber-300">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all hover:shadow-2xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-amber-400/60">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/admin-login')}
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-amber-400/60">
            Admin access only. This account will have full administrative privileges.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
