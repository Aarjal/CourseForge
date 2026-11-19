import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import { api } from "../api";
import { getStoredStatus } from "../services/storage";

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState(() => getStoredStatus());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setAuthStatus((prev) => ({
            ...prev,
            loggedin: true,
            user: currentUser,
          }));
        }
      } catch (err) {
        console.warn("Could not retrieve current user session:", err.message);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function login(email, password) {
    if (!email || !password) {
      throw new Error("Enter an email and password to continue");
    }

    const result = await api.login({ email, password });
    setAuthStatus((prev) => ({
      ...prev,
      loggedin: true,
      user: result.user,
    }));
    return result;
  }

  async function logout() {
    await api.logout();
    setAuthStatus((prev) => ({
      ...prev,
      loggedin: false,
      user: null,
    }));
  }

  const value = {
    isLoggedIn: Boolean(authStatus.loggedin),
    user: authStatus.user,
    authStatus,
    setAuthStatus,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
