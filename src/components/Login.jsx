import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
            <LogIn className="h-12 w-12 text-slate-700 dark:text-slate-300 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">LOGIN</h2>
          </div>

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

          <div className="mt-6 text-center text-xs text-gray-500 dark:text-slate-400 border-t dark:border-slate-700 pt-4">
            <p className="font-semibold text-gray-600 dark:text-slate-300 mb-1">Demo credentials:</p>
            <p>Admin: <code className="bg-gray-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">admin</code> / <code className="bg-gray-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">admin123</code></p>
            <p>User: <code className="bg-gray-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">abi</code> / <code className="bg-gray-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono">user123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;