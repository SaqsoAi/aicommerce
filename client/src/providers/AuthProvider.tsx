"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getMe, logoutUser } from "@/services/auth.service";

type AuthContextType = {
  user: any;
  token: string | null;
  role: string;
  ready: boolean;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  setRole: (role: string) => void;
  login: (user: any, token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState("CUSTOMER");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    if (savedToken) setToken(savedToken);
    if (savedRole) setRole(savedRole);

    let cancelled = false;
    getMe()
      .then((response: any) => {
        if (cancelled) return;
        const sessionUser = response?.data?.user || response?.data || response?.user;
        if (sessionUser?.id || sessionUser?.email) {
          setUser(sessionUser);
          setRole(sessionUser.role || savedRole || "CUSTOMER");
          localStorage.setItem("user", JSON.stringify(sessionUser));
          localStorage.setItem("role", sessionUser.role || savedRole || "CUSTOMER");
        }
      })
      .catch(() => {
        // A stale local session must never keep protected UI authenticated.
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("customerToken");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = (userData: any, jwtToken: string) => {
    const userRole = userData?.role || "CUSTOMER";

    setUser(userData);
    setToken(jwtToken);
    setRole(userRole);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    // Remove historical aliases so all client code converges on one key.
    localStorage.removeItem("customerToken");
    localStorage.removeItem("accessToken");
    localStorage.setItem("role", userRole);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole("CUSTOMER");

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    void logoutUser().catch(() => undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        ready,
        isAuthenticated: Boolean(user),
        setUser,
        setRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      user: null,
      token: null,
      role: "CUSTOMER",
      ready: true,
      isAuthenticated: false,
      setUser: () => {},
      setRole: () => {},
      login: () => {},
      logout: () => {},
    };
  }

  return context;
};

