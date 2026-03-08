import { create } from "zustand";
import { AdminUser } from "@/types/auth.types";

interface AuthStore {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

const storedUser = localStorage.getItem("adminUser");

export const useAuthStore = create<AuthStore>((set) => ({
  user: storedUser ? (JSON.parse(storedUser) as AdminUser) : null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),

  login: (token, user) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    set({ accessToken: token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminUser");
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
