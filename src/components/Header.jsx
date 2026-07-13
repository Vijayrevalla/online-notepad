import React from 'react';
import { BookOpen, Home, LogIn, UserPlus, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const Header = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    addToast(`Goodbye ${user.username}! See you next time 👋`, 'info');
    setTimeout(() => {
      onNavigate('home');
    }, 500);
  };

  return (
    <header className="bg-slate-700 dark:bg-slate-900 text-white shadow-lg border-b border-slate-600 dark:border-slate-800 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('home')}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-semibold">Online Notepad</span>
          </div>

          <nav className="flex items-center space-x-4">
            {!user ? (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'home' ? 'bg-slate-600 dark:bg-slate-800' : 'hover:bg-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'login' ? 'bg-slate-600 dark:bg-slate-800' : 'hover:bg-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'signup' ? 'bg-slate-600 dark:bg-slate-800' : 'hover:bg-slate-600 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-sm opacity-75">Welcome, {user.username}</span>
                {user.role === 'admin' && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                      currentPage === 'admin' ? 'bg-slate-600 dark:bg-slate-800' : 'hover:bg-slate-600 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-slate-600 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}

            {/* Premium Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-600 dark:hover:bg-slate-800 transition-all duration-350 text-indigo-200 dark:text-amber-400 hover:scale-110 flex items-center justify-center cursor-pointer focus:outline-none"
              aria-label="Toggle Theme"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;