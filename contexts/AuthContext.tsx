
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, UserRole } from '../types';
import { mockLogin, mockSignup, mockLogout, mockOnAuthStateChanged } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = mockOnAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await mockLogin(email, password);
      setUser(authUser);
    } catch (error) {
      setUser(null); // Ensure user is null on error
      throw error; // Re-throw to be caught by UI
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const authUser = await mockSignup(name, email, password);
      setUser(authUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await mockLogout();
      setUser(null);
    } catch (error) {
      // Handle logout error if necessary, though mockLogout is unlikely to fail
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;