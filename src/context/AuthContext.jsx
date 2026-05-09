import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { id: 2, username: 'abi', email: 'abi@example.com', password: 'user123', role: 'user' },
    { id: 3, username: 'john', email: 'john@example.com', password: 'user123', role: 'user' }
  ];

  const mockNotepads = [
    { 
      id: 1, 
      title: 'Welcome Notes', 
      content: 'Welcome to the Online Notepad System!', 
      code: 'WN2024001', 
      createdBy: 2, 
      createdAt: new Date().toISOString(),
      isPublic: true 
    },
    { 
      id: 2, 
      title: 'Project Ideas', 
      content: 'Here are some project ideas...', 
      code: 'PI2024002', 
      createdBy: 2, 
      createdAt: new Date().toISOString(),
      isPublic: false 
    }
  ];

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Initialize mock data
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem('notepads')) {
      localStorage.setItem('notepads', JSON.stringify(mockNotepads));
    }
    
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username or email already exists
    if (users.some(u => u.username === userData.username || u.email === userData.email)) {
      return false;
    }

    const newUser = {
      id: users.length + 1,
      ...userData,
      role: 'user'
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};