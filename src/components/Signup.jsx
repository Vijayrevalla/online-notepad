import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Signup = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      addToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    
    if (signup(userData)) {
      addToast(`Welcome ${formData.username}! Account created successfully 🎉`, 'success');
      
      setTimeout(() => {
        onNavigate('dashboard');
      }, 500);
    } else {
      setError('Username or email already exists');
      addToast('Username or email already exists', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-2xl p-8 border-0 transition-colors duration-200">
          <div className="text-center mb-8">
            <UserPlus className="h-12 w-12 text-slate-700 dark:text-slate-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">SIGNUP</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Username:
              </label>
              <input
                type="text"
                name="username"
                placeholder="Enter Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Email:
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Confirm Password:
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-700 dark:bg-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors font-medium flex items-center justify-center space-x-2 cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>SAVE</span>
              <span>▶</span>
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-slate-400">Already have an account? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="bg-slate-600 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-650 transition-colors font-medium cursor-pointer"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;