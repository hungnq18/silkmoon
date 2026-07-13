import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getProfile()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    const profile = await authApi.getProfile();
    setUser(profile);
    return profile;
  };

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem('token', data.access_token);
    await refreshProfile();
  };

  const register = async (information) => {
    return authApi.register(information);
  };

  const verifyRegistration = async (email, otp) => {
    const data = await authApi.verifyRegistration(email, otp);
    localStorage.setItem('token', data.access_token);
    await refreshProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyRegistration, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
