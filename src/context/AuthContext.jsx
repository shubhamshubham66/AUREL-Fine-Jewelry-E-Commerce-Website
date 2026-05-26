import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('aurel_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('aurel_user');
      }
    }
  }, []);

  const login = (email, password, name) => {
    const userData = { name: name || email.split('@')[0], email };
    localStorage.setItem('aurel_user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const signup = (name, email, password) => {
    const userData = { name, email };
    localStorage.setItem('aurel_user', JSON.stringify(userData));
    setUser(userData);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('aurel_user');
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
