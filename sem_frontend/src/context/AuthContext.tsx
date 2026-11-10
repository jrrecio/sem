
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import api from "../lib/api";

type Role = "admin" | "user";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
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

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

function isUser(value: unknown): value is User {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "number" &&
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    (record.role === "admin" || record.role === "user")
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get<unknown>("/user")
      .then((res) => {
        if (!isUser(res.data)) {
          throw new Error("Invalid user data from Laravel");
        }

        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    const { data } = await api.post<LoginResponse>(
      "/login",
      {
        email,
        password,
      }
    );

    if (!isUser(data.user)) {
      throw new Error(
        "Laravel login response is missing a valid user role"
      );
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  // Register
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<void> => {
    await api.post<RegisterResponse>(
      "/register",
      {
        name,
        email,
        password,
      }
    );
  };

  // Logout
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
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return ctx;
}
