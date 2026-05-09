import React from 'react';
import { BookOpen, Home, LogIn, UserPlus, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Header = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast(`Goodbye ${user.username}! See you next time 👋`, 'info');
    setTimeout(() => {
      onNavigate('home');
    }, 500);
  };

  return (
    <header className="bg-slate-700 text-white shadow-lg">
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
                    currentPage === 'home' ? 'bg-slate-600' : 'hover:bg-slate-600'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'login' ? 'bg-slate-600' : 'hover:bg-slate-600'
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                    currentPage === 'signup' ? 'bg-slate-600' : 'hover:bg-slate-600'
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
                      currentPage === 'admin' ? 'bg-slate-600' : 'hover:bg-slate-600'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-slate-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;