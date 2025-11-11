// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "EDITOR" | "ADMIN";
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();

// Debug: print tokens if present
if (data.data?.accessToken || data.data?.refreshToken) {
  console.log("🪙 Access Token:", data.data.accessToken);
  console.log("🔁 Refresh Token:", data.data.refreshToken);
} else {
  console.log("⚠️ No tokens found in response — likely stored in HttpOnly cookies");
}

      if (data.data?.user) {
        setUser(data.data.user);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};

  // ✅ NEW: Rehydrate user from cookies on mount
  useEffect(() => {
    const rehydrateUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", 
        });
       
    if (response.status === 401) {
      // Token might be expired, try to refresh
      console.log("Token expired or missing, attempting refresh...");
      const refreshResponse = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Retry getting user info after refresh
        const retryResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          if (data.authenticated && data.data?.user) {
            setUser(data.data.user);
            console.log();
            
            console.log("User rehydrated after token refresh");
          }
        }
      } else {
        // No valid refresh token, user needs to login
        console.log("No valid refresh token, user needs to login");
        setUser(null);
      }
    } else if (response.ok) {
      const data = await response.json();
      if (data.authenticated && data.data?.user) {
        setUser(data.data.user);
        console.log("User rehydrated successfully");
      }
    } else {
      // Other error case
      setUser(null);
    }
      } catch (error) {
        console.error("Rehydration error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    rehydrateUser();
  }, []);

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    setIsLoading(true);
    setAuthError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // This is crucial!
      body: JSON.stringify({ email, password }),
    
    });
      console.log("email",{email},{password}) 
   
    if (!response.ok) {
      const error = await response.json();
      setAuthError(error.error || "Login failed");
      return false;
    }

    const data = await response.json();
    
    // Immediately verify the session
    const meResponse = await fetch("/api/auth/me", {
      credentials: "include",
    });
    
    if (meResponse.ok) {
      const meData = await meResponse.json();
      if (meData.authenticated && meData.data?.user) {
        setUser(meData.data.user);
        console.log("✅ Login successful, user:", meData.data.user);
        return true;
      }
    }
    
    setAuthError("Login successful but session verification failed");
    return false;
  } catch (error) {
    setAuthError("An error occurred during login");
    console.error("Login error:", error);
    return false;
  } finally {
    setIsLoading(false);
  }
};

const register = async (email: string, password: string, name: string): Promise<boolean> => {
  try {
    setIsLoading(true);
    setAuthError(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    
    });

    if (!response.ok) {
      const error = await response.json();
      setAuthError(error.error || "Registration failed");
      return false;
    }

    const data = await response.json();
  
    console.log("✅ Registration successful, user should login separately");
    return true;

  } catch (error) {
    setAuthError("An error occurred during registration");
    console.error("Register error:", error);
    return false;
  } finally {
    setIsLoading(false);
  }
};


  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAuthError(error.error || "Password reset failed");
        return false;
      }

      return true;
    } catch (error) {
      setAuthError("An error occurred");
      console.error("Forgot password error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}