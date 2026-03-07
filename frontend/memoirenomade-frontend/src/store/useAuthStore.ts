import { create } from "zustand";
import { AdminUser } from "@/types/auth.types";

interface AuthStore {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),

  login: (token, user) => {
    localStorage.setItem("accessToken", token);
    set({ accessToken: token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
