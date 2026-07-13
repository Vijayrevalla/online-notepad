import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, User, Edit3, Trash2, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('my-notepads');
  const [notepads, setNotepads] = useState([]);
  const [showNewNotepad, setShowNewNotepad] = useState(false);
  const [newNotepadTitle, setNewNotepadTitle] = useState('');

  useEffect(() => {
    loadNotepads();
  }, [user]);

  const loadNotepads = () => {
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const userNotepads = allNotepads.filter(n => n.createdBy === user.id);
    setNotepads(userNotepads);
  };

  const generateUniqueCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const createNotepad = () => {
    if (!newNotepadTitle.trim()) {
      addToast('Please enter a title for your notepad', 'error');
      return;
    }

    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const newNotepad = {
      id: allNotepads.length + 1,
      title: newNotepadTitle,
      content: '',
      code: generateUniqueCode(),
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    allNotepads.push(newNotepad);
    localStorage.setItem('notepads', JSON.stringify(allNotepads));
    loadNotepads();
    setNewNotepadTitle('');
    setShowNewNotepad(false);
    addToast(`Notepad "${newNotepadTitle}" created successfully! 📝`, 'success');
  };

  const deleteNotepad = (id) => {
    if (window.confirm('Are you sure you want to delete this notepad?')) {
      const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
      const notepadToDelete = allNotepads.find(n => n.id === id);
      const updatedNotepads = allNotepads.filter(n => n.id !== id);
      localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
      loadNotepads();
      addToast(`Notepad "${notepadToDelete.title}" deleted successfully 🗑️`, 'info');
    }
  };

  const togglePublic = (id) => {
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    const notepad = allNotepads.find(n => n.id === id);
    const updatedNotepads = allNotepads.map(n => 
      n.id === id ? { ...n, isPublic: !n.isPublic } : n
    );
    localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
    loadNotepads();
    addToast(
      notepad.isPublic 
        ? `Notepad "${notepad.title}" is now private 🔒` 
        : `Notepad "${notepad.title}" is now public 🌍`,
      'info'
    );
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    addToast('Share code copied to clipboard! 📋', 'success');
  };


  const sidebarItems = [
    { key: 'create', icon: PlusCircle, label: 'Create Notepad' },
    { key: 'my-notepads', icon: FileText, label: 'My Notepads' },
    { key: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-64 bg-slate-700 dark:bg-slate-900 text-white border-r border-transparent dark:border-slate-800 transition-colors duration-200">
        <div className="p-6 border-b border-slate-600 dark:border-slate-800">
          <h2 className="text-xl font-semibold truncate">Welcome {user.username}</h2>
        </div>
        <nav className="mt-6">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'create') {
                  setShowNewNotepad(true);
                } else {
                  setActiveTab(item.key);
                }
              }}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-slate-600 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeTab === item.key && item.key !== 'create' ? 'bg-slate-600 dark:bg-slate-800 border-l-4 border-blue-500' : 'pl-7'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'my-notepads' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Notepads</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notepads.map(notepad => (
                <div key={notepad.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-2xl p-6 hover:shadow-lg dark:hover:shadow-3xl border border-transparent dark:border-slate-700 transition-all duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate pr-2" title={notepad.title}>{notepad.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onNavigate('notepad', notepad.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNotepad(notepad.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-650 dark:text-slate-355 text-sm mb-4 line-clamp-3 h-15">
                    {notepad.content || 'No content yet...'}
                  </p>
                  
                  <div className="space-y-3 border-t dark:border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-slate-400 font-mono bg-gray-100 dark:bg-slate-900 px-2 py-0.5 rounded">Code: {notepad.code}</span>
                      <button
                        onClick={() => copyCode(notepad.code)}
                        className="p-1.5 text-gray-400 hover:text-gray-650 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-gray-150 dark:hover:bg-slate-700 rounded transition-all cursor-pointer"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => togglePublic(notepad.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          notepad.isPublic 
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                            : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300 border border-gray-250 dark:border-slate-600'
                        }`}
                      >
                        {notepad.isPublic ? 'Public' : 'Private'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notepads.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-gray-550 dark:text-slate-400">No notepads created yet. Click "Create Notepad" to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Profile</h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-transparent dark:border-slate-700 p-6 max-w-md transition-colors duration-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400">Username</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white font-medium">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400">Email</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-slate-400">Role</label>
                  <p className="mt-1 text-lg text-gray-900 dark:text-white font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Notepad Modal */}
      {showNewNotepad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-850 rounded-lg shadow-2xl p-6 w-96 border border-transparent dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Notepad</h3>
            <input
              type="text"
              placeholder="Enter notepad title"
              value={newNotepadTitle}
              onChange={(e) => setNewNotepadTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 dark:bg-slate-750 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createNotepad()}
            />
            <div className="flex space-x-3">
              <button
                onClick={createNotepad}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewNotepad(false);
                  setNewNotepadTitle('');
                }}
                className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-650 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;