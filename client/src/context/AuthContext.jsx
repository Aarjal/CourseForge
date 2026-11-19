import { useState, useEffect } from "react";
import { AuthContext } from "./authContextDef";
import { getStoredStatus, saveStoredStatus } from "../services/storage";

export function AuthProvider({ children }) {
  const [authStatus, setAuthStatus] = useState(() => getStoredStatus());

  useEffect(() => {
    saveStoredStatus(authStatus);
  }, [authStatus]);

  function login(email, password) {
    if (!email || !password) {
      throw new Error("Enter an email and password to continue");
    }

    setAuthStatus((prev) => {
      const next = {
        ...prev,
        loggedin: true,
        user: { email, role: email.includes("admin") ? "admin" : "student" },
      };
      saveStoredStatus(next);
      return next;
    });
  }

  function logout() {
    setAuthStatus((prev) => {
      const next = {
        ...prev,
        loggedin: false,
        user: null,
      };
      saveStoredStatus(next);
      return next;
    });
  }

  const value = {
    isLoggedIn: Boolean(authStatus.loggedin),
    user: authStatus.user,
    authStatus,
    setAuthStatus,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
