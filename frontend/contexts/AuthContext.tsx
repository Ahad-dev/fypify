"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/shared/types/api.types";
import { userService } from "@/shared/services/user.service";
import LoadingScreen from "@/components/common/LoadingScreen";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate token and fetch user data on mount
    const validateAndFetchUser = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        try {
          const response = await userService.getCurrentUser();
          setUser(response.data);
        } catch (error) {
          // Token is invalid or expired, clear it
          console.error("Failed to validate token:", error);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    validateAndFetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
