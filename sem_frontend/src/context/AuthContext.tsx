
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/api";
import { Navigate } from "react-router";
import { useNavigate } from "react-router";


interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterResponse {
  message: string;
  data: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate()
  // Restore session on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login")
      setLoading(false);
      return;
    }

    api
      .get<User>("/user")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<LoginResponse>("/login", {
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    await api.post<RegisterResponse>("/register", {
      name,
      email,
      password,
    });
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post("/logout");
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
