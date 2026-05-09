import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, User, Download, Edit3, Trash2, Share2, Copy } from 'lucide-react';
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

  const exportNotepad = (notepad) => {
    const dataStr = JSON.stringify(notepad, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${notepad.title.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const sidebarItems = [
    { key: 'create', icon: PlusCircle, label: 'Create Notepad' },
    { key: 'my-notepads', icon: FileText, label: 'My Notepads' },
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'export', icon: Download, label: 'Export by Title' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-700 text-white">
        <div className="p-6">
          <h2 className="text-xl font-semibold">Welcome {user.username}</h2>
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
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-slate-600 transition-colors ${
                activeTab === item.key && item.key !== 'create' ? 'bg-slate-600' : ''
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'my-notepads' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Notepads</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notepads.map(notepad => (
                <div key={notepad.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">{notepad.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onNavigate('notepad', notepad.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNotepad(notepad.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {notepad.content || 'No content yet...'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Code: {notepad.code}</span>
                      <button
                        onClick={() => copyCode(notepad.code)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => togglePublic(notepad.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          notepad.isPublic 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {notepad.isPublic ? 'Public' : 'Private'}
                      </button>
                      
                      <button
                        onClick={() => exportNotepad(notepad)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notepads.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notepads created yet. Click "Create Notepad" to get started!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-gray-900">{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Export by Title</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 mb-4">Select notepads to export:</p>
              <div className="space-y-3">
                {notepads.map(notepad => (
                  <div key={notepad.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{notepad.title}</span>
                    <button
                      onClick={() => exportNotepad(notepad)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Notepad Modal */}
      {showNewNotepad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Notepad</h3>
            <input
              type="text"
              placeholder="Enter notepad title"
              value={newNotepadTitle}
              onChange={(e) => setNewNotepadTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && createNotepad()}
            />
            <div className="flex space-x-3">
              <button
                onClick={createNotepad}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewNotepad(false);
                  setNewNotepadTitle('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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