import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import NotepadEditor from './components/NotepadEditor';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [notepadId, setNotepadId] = useState(null);
  const { user, isLoading } = useAuth();

  const navigate = (page, id = null) => {
    setCurrentPage(page);
    setNotepadId(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (user && (currentPage === 'login' || currentPage === 'signup')) {
    if (user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('dashboard');
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'login':
        return <Login onNavigate={navigate} />;
      case 'signup':
        return <Signup onNavigate={navigate} />;
      case 'dashboard':
        return user ? <Dashboard onNavigate={navigate} /> : <Home onNavigate={navigate} />;
      case 'admin':
        return user && user.role === 'admin' ? <AdminDashboard onNavigate={navigate} /> : <Home onNavigate={navigate} />;
      case 'notepad':
        return <NotepadEditor notepadId={notepadId} onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {(currentPage !== 'home' && currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'notepad') && (
        <Header currentPage={currentPage} onNavigate={navigate} />
      )}
      {renderPage()}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;