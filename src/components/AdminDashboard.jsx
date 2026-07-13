import React, { useState, useEffect } from 'react';
import { Users, FileText, Settings, UserCheck, UserX, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [notepads, setNotepads] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allNotepads = JSON.parse(localStorage.getItem('notepads') || '[]');
    setUsers(allUsers);
    setNotepads(allNotepads);
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: user.isActive !== false ? false : true }
        : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Also remove user's notepads
      const updatedNotepads = notepads.filter(notepad => notepad.createdBy !== userId);
      setNotepads(updatedNotepads);
      localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
    }
  };

  const toggleNotepadAccess = (notepadId) => {
    const updatedNotepads = notepads.map(notepad => 
      notepad.id === notepadId 
        ? { ...notepad, isPublic: !notepad.isPublic }
        : notepad
    );
    setNotepads(updatedNotepads);
    localStorage.setItem('notepads', JSON.stringify(updatedNotepads));
  };

  const sidebarItems = [
    { key: 'users', icon: Users, label: 'Manage Users' },
    { key: 'notepads', icon: FileText, label: 'Manage Notepads' },
    { key: 'settings', icon: Settings, label: 'System Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 dark:bg-slate-900 text-white border-r border-transparent dark:border-slate-800 transition-colors duration-200">
        <div className="p-6 border-b border-slate-700 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">Admin Panel</h2>
          </div>
        </div>
        <nav className="mt-6">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeTab === item.key ? 'bg-slate-700 dark:bg-slate-800 border-l-4 border-blue-500' : 'pl-7'
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
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Users</h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-transparent dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-150 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.username}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${
                          user.isActive !== false 
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm cursor-pointer transition-colors ${
                            user.isActive !== false
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-900/40'
                          }`}
                        >
                          {user.isActive !== false ? (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-650 text-white px-3 py-1 rounded-md hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notepads' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Manage Notepads</h1>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-transparent dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-150 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {notepads.map(notepad => {
                    const owner = users.find(u => u.id === notepad.createdBy);
                    return (
                      <tr key={notepad.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{notepad.title}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            Created: {new Date(notepad.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {owner ? owner.username : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-300 font-mono">
                          {notepad.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            notepad.isPublic 
                              ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50' 
                              : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300 border border-gray-250 dark:border-slate-600'
                          }`}>
                            {notepad.isPublic ? 'Public' : 'Private'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleNotepadAccess(notepad.id)}
                            className={`px-3 py-1 rounded-md text-sm cursor-pointer transition-colors ${
                              notepad.isPublic
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/40'
                            }`}
                          >
                            {notepad.isPublic ? 'Make Private' : 'Make Public'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">System Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-transparent dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Total Users:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Active Users:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {users.filter(u => u.isActive !== false).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Total Notepads:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{notepads.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Public Notepads:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {notepads.filter(n => n.isPublic).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-transparent dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Allow Public Registration:</span>
                    <button className="bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-900/50 px-3 py-1 rounded-full text-xs font-semibold">
                      Enabled
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Require Email Verification:</span>
                    <button className="bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300 border border-gray-250 dark:border-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      Disabled
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-350">Auto-backup Notepads:</span>
                    <button className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 px-3 py-1 rounded-full text-xs font-semibold">
                      Daily
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;