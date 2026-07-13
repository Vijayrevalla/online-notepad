import React, { useState } from 'react';
import { LogIn, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isResetting, setIsResetting] = useState(false);
  const [resetData, setResetData] = useState({
    username: '',
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    
    if (!resetData.username || !resetData.email || !resetData.newPassword || !resetData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.username === resetData.username && u.email === resetData.email);
    
    if (userIndex !== -1) {
      users[userIndex].password = resetData.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      addToast('Password reset successfully! You can now log in. 🔑', 'success');
      setIsResetting(false);
      setFormData({ username: resetData.username, password: '' });
      setResetData({ username: '', email: '', newPassword: '', confirmPassword: '' });
    } else {
      setError('Incorrect username or email address');
      addToast('Incorrect username or email address', 'error');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      addToast('Please fill in all fields', 'error');
      return;
    }

    if (login(formData.username, formData.password)) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === formData.username);
      
      addToast(`Welcome back, ${formData.username}! 🎉`, 'success');
      
      setTimeout(() => {
        if (user.role === 'admin') {
          onNavigate('admin');
        } else {
          onNavigate('dashboard');
        }
      }, 500);
    } else {
      setError('Invalid username or password');
      addToast('Invalid username or password', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl dark:shadow-2xl p-8 border-0 transition-colors duration-200">
          <div className="text-center mb-8">
            {isResetting ? (
              <KeyRound className="h-12 w-12 text-slate-700 dark:text-slate-300 mx-auto mb-4" />
            ) : (
              <LogIn className="h-12 w-12 text-slate-700 dark:text-slate-300 mx-auto mb-4" />
            )}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isResetting ? 'RESET PASSWORD' : 'LOGIN'}
            </h2>
          </div>

          {!isResetting ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Username:
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Name"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setError('');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-700 dark:bg-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors font-medium cursor-pointer shadow-md hover:shadow-lg"
              >
                Login
              </button>

              <div className="text-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="bg-slate-600 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-650 transition-colors font-medium cursor-pointer"
                >
                  Signup
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Username:
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Username"
                  value={resetData.username}
                  onChange={(e) => {
                    setResetData({ ...resetData, username: e.target.value });
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email Address:
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  value={resetData.email}
                  onChange={(e) => {
                    setResetData({ ...resetData, email: e.target.value });
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  New Password:
                </label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter New Password"
                  value={resetData.newPassword}
                  onChange={(e) => {
                    setResetData({ ...resetData, newPassword: e.target.value });
                    setError('');
                  }}
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
                  placeholder="Confirm New Password"
                  value={resetData.confirmPassword}
                  onChange={(e) => {
                    setResetData({ ...resetData, confirmPassword: e.target.value });
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-slate-700 dark:bg-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors font-medium cursor-pointer shadow-md hover:shadow-lg"
              >
                Reset Password
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetting(false);
                    setError('');
                    setResetData({ username: '', email: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-gray-500 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 dark:hover:bg-slate-600 transition-colors font-medium cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}


        </div>
      </div>
    </div>
  );
};

export default Login;