import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('alex_port_token');
    const u = localStorage.getItem('alex_port_user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch { /* corrupted storage */ }
    }
    setLoading(false);
  }, []);

  const login = (tok, userData) => {
    setToken(tok);
    setUser(userData);
    localStorage.setItem('alex_port_token', tok);
    localStorage.setItem('alex_port_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('alex_port_token');
    localStorage.removeItem('alex_port_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
