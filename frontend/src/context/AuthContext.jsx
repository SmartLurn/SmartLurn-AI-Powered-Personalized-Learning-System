
import { createContext, useState } from "react";
import api from "../config/api";

export const AuthContext = createContext();

// The login is saved in localStorage, so it survives closing the browser.
// The token itself expires after 7 days (set by the backend), then the user logs in again.

// True if the saved token's 7 days are over (reads the "exp" time inside the JWT)
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// Read the saved login, removing it first if it has expired
const getSavedLogin = () => {
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }

  try {
    return { token, user: JSON.parse(localStorage.getItem("user")) };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [savedLogin] = useState(getSavedLogin);
  const [user, setUser] = useState(savedLogin.user);
  const [token, setToken] = useState(savedLogin.token);
  const [isAuthLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  // Save the login in state and localStorage
  const saveLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    setToken(data.token);
  };

  // Signup
  const signup = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      saveLogin(data);
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveLogin(data);
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  // Update the saved user after editing the profile (name/email)
  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isAuthLoading,
    signup,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
