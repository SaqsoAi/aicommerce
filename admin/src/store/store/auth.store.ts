import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  hydrate: () => void;
  logout: () => void;
}

const readToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: readToken(),
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null,

  setToken: (token) => {
    if (typeof window !== "undefined") localStorage.setItem("token", token);
    set({ token });
  },

  setUser: (user) => {
    if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  hydrate: () => {
    if (typeof window === "undefined") return;
    set({
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user") || "null"),
    });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      ["token","user","admin","adminUser","accessToken","authToken"].forEach((k) =>
        localStorage.removeItem(k)
      );
      window.location.href = "/login";
    }
    set({ token: null, user: null });
  },
}));
