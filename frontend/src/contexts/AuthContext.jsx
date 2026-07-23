import { createContext, useContext, useEffect, useState } from "react";
import {
  getProfile,
  getToken,
  login,
  register,
  resetPassword as resetPasswordApi,
  clearToken,
} from "../utils/api";

const AuthContext = createContext({});

// Custom hook to use auth context with error handling
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!getToken()) {
          setUser(null);
          return;
        }
        const { user: profile } = await getProfile();
        setUser(profile);
      } catch (error) {
        clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email, password, userData = {}) => {
    const response = await register({
      email: email.trim().toLowerCase(),
      password,
      name: userData.name || "",
      phone: userData.phone || "",
    });
    setUser(response.user);
    return response.user;
  };

  const signIn = async (email, password) => {
    const response = await login({
      email: email.trim().toLowerCase(),
      password,
    });
    setUser(response.user);
    return response.user;
  };

  const signOut = async () => {
    clearToken();
    setUser(null);
  };

  const resetPassword = async (email, password) => {
    return resetPasswordApi({ email: email.trim().toLowerCase(), password });
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
