"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type AuthContextType = {
  user: any;
  token: string | null;
  role: string;
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token") || localStorage.getItem("customerToken") || localStorage.getItem("accessToken");
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
  }, []);

  const login = (userData: any, jwtToken: string) => {
    const userRole = userData?.role || "CUSTOMER";

    setUser(userData);
    setToken(jwtToken);
    setRole(userRole);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("customerToken", jwtToken);
    localStorage.setItem("accessToken", jwtToken);
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
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
      setUser: () => {},
      setRole: () => {},
      login: () => {},
      logout: () => {},
    };
  }

  return context;
};

