import api from "./api";
import { AdminUser } from "@/types/auth.types";

export const authService = {
  login: async (
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    user: AdminUser;
  }> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  refresh: async (): Promise<{ accessToken: string; user: AdminUser }> => {
    const { data } = await api.post("/auth/refresh");
    return data;
  },
};
