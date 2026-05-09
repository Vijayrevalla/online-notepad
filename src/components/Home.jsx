import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';

const Home = ({ onNavigate }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const handleCodeAccess = () => {
    if (!accessCode.trim()) {
      setError('Please enter a valid code');
      return;
    }
    const notepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const foundNotepad = notepads.find(n => n.code === accessCode && n.isPublic);

    if (foundNotepad) {
      // Store accessed notepad for guest viewing
      localStorage.setItem('guestNotepad', JSON.stringify(foundNotepad));
      onNavigate('notepad', foundNotepad.id);
    } else {
      setError('Invalid code or notepad not found');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCodeAccess();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-xl p-8 border-0">
          <div className="text-center mb-8">
            <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Online Notepad</h1>
            <p className="text-gray-600">Access and collaborate on shared notepads</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-center text-gray-700 mb-4">
                Let's try. Enter a new or used code now to open, encrypt and save notes with.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                />
                
                <button
                  onClick={handleCodeAccess}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Search className="h-5 w-5" />
                  <span>Open</span>
                </button>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">It's that simple!</p>
              <p className="text-xs text-gray-400">
                For example you can use <code className="bg-gray-100 px-2 py-1 rounded">WN2024001</code>
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-center text-sm text-gray-600 mb-4">
                Want to create your own notepads?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="flex-1 bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;