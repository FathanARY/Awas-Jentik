"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppUser {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  token: string | null;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("access_token");
      const savedUser = localStorage.getItem("user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, userData: AppUser) => {
    setToken(newToken);
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
