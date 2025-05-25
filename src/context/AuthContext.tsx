import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: 'customer' | 'banker';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('bankUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('bankUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('bankUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bankUser');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};