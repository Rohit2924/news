"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  userRole: string | null;
  userId: string | null;
  token: string | null;
  setAuthState: (
    username: string | null,
    userRole: string | null,
    userId: string | null
  ) => void;
  logout: () => void;
  isAdmin: boolean;
  adminToken: string | null;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  forgotPassword: (email: string, newPassword: string) => boolean;
  authError: string;
  setAuthError: (err: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>("");

  // Helper function to safely access localStorage
  const getLocalStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  // Helper function to safely set localStorage
  const setLocalStorageItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  // Helper function to safely remove localStorage
  const removeLocalStorageItem = (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  };

  // Initialize token from localStorage safely
  useEffect(() => {
    const storedToken = getLocalStorageItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Real login function that connects to the database
  const login = async (email: string, password: string, role: string = "user"): Promise<boolean> => {
    setAuthError("");
    
    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.error) {
        setAuthError(data.message || 'Login failed');
        return false;
      }

      // Store user data and token
      const { user, token: userToken } = data.data;
      
      setIsAuthenticated(true);
      setUsername(user.name || user.email);
      setUserRole(user.role);
      setUserId(user.id);
      setToken(userToken);
      
      // Store in localStorage
      setLocalStorageItem("token", userToken);
      setLocalStorageItem("username", user.name || user.email);
      setLocalStorageItem("role", user.role);
      setLocalStorageItem("userId", user.id);
      setLocalStorageItem("email", user.email);
      
      if (user.image) {
        setLocalStorageItem("image", user.image);
      }
      if (user.contactNumber) {
        setLocalStorageItem("contactNumber", user.contactNumber);
      }

      return true;
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Network error. Please try again.');
      return false;
    }
  };

  // Dummy forgot password function (replace with real API call)
  const forgotPassword = (email: string, newPassword: string) => {
    setAuthError("");
    if (email && newPassword.length >= 6) {
      // Simulate success
      return true;
    } else {
      setAuthError("Invalid email or password");
      return false;
    }
  };

  // Check if user has admin privileges
  const isAdmin = userRole === "admin" || userRole === "editor" || userRole === "user";

  useEffect(() => {
    const storedUsername = getLocalStorageItem("username");
    const storedRole = getLocalStorageItem("role");
    const storedUserId = getLocalStorageItem("userId");
    const storedToken = getLocalStorageItem("token");
    const storedAdminToken = getLocalStorageItem("adminToken");

    if (storedUsername && storedToken) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setUserRole(storedRole);
      setUserId(storedUserId);
      setToken(storedToken);

      // If we have an admin token, set it in state
      if (storedAdminToken) {
        setAdminToken(storedAdminToken);
      }
      
      console.log('Auth state restored:', { storedUsername, storedRole, storedUserId, hasToken: !!storedToken });
    } else {
      console.log('No stored auth found:', { storedUsername, hasToken: !!storedToken });
    }
  }, []);

  // Function to update auth state when user logs in
  const setAuthState = (
    newUsername: string | null,
    newUserRole: string | null,
    newUserId: string | null
  ) => {
    setUsername(newUsername);
    setUserRole(newUserRole);
    setUserId(newUserId);
    setIsAuthenticated(!!newUsername && !!getLocalStorageItem("token"));

    // Handle admin authentication
    if (newUserRole === "admin" || newUserRole === "editor" || newUserRole === "user") {
      const token = getLocalStorageItem("token");
      if (token) {
        setLocalStorageItem("authToken", token);
        const adminData = {
          email: getLocalStorageItem("email") || "",
          name: newUsername || "",
          role: newUserRole,
          token: token,
          image: getLocalStorageItem("image") || "",
          contactNumber: getLocalStorageItem("contactNumber") || "",
        };
        setLocalStorageItem("user", JSON.stringify(adminData));
      }
    }
  };

  // Enhanced logout function that also clears admin tokens
  const logout = () => {
    removeLocalStorageItem("token");
    removeLocalStorageItem("username");
    removeLocalStorageItem("role");
    removeLocalStorageItem("userId");
    removeLocalStorageItem("cart");
    removeLocalStorageItem("adminToken");
    removeLocalStorageItem("authToken");
    removeLocalStorageItem("user");
    removeLocalStorageItem("email");
    removeLocalStorageItem("image");
    removeLocalStorageItem("contactNumber");

    setIsAuthenticated(false);
    setUsername(null);
    setUserRole(null);
    setUserId(null);
    setAdminToken(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        userRole,
        userId,
        token,
        setAuthState,
        logout,
        isAdmin,
        adminToken,
        login,
        forgotPassword,
        authError,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};