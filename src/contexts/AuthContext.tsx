"use client";

import * as React from "react";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "../lib/api";

interface User {
  userId: number;
  email: string;
  role: "ADMIN" | "USER";
  meterId?: number;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("eletroon_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({ userId: payload.sub, email: payload.email, role: payload.role, meterId: payload.meterId });
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (data: LoginData) => {
    const response = await api.post(`/auth/login`, data);
    const { access_token } = response.data;

    localStorage.setItem("eletroon_token", access_token);
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

    const payload = JSON.parse(atob(access_token.split(".")[1]));
    setUser({ userId: payload.sub, email: payload.email, role: payload.role, meterId: payload.meterId });

    if (payload.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eletroon_token");
    delete api.defaults.headers.common["Authorization"];
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      isAuthenticated: false,
      user: null,
      login: async () => {},
      logout: () => {},
      isLoading: true,
    } as AuthContextType;
  }
  return context;
}
