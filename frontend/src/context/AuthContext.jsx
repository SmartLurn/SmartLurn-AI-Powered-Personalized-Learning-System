
import { createContext, useState } from "react";
import api from "../config/api";

export const AuthContext = createContext();

// Read the saved login (if any) so a page refresh keeps the user logged in
const getSavedUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user"));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [isAuthLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  // Save the login in state and sessionStorage
  const saveLogin = (data) => {
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  // Update the saved user after editing the profile (name/email)
  const updateUser = (updatedUser) => {
    const newUser = { ...user, ...updatedUser };
    sessionStorage.setItem("user", JSON.stringify(newUser));
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
