import api from "./api";
import { Session } from "@/types/session.types";

export const sessionService = {
  getSessionsByTour: async (tourId: number): Promise<Session[]> => {
    const { data } = await api.get(`/tours/${tourId}/sessions`);
    return data;
  },

  // Admin
  getAllSessions: async (
    tourId?: number,
    status?: string,
  ): Promise<Session[]> => {
    const params = new URLSearchParams();
    if (tourId) params.append("tourId", tourId.toString());
    if (status) params.append("status", status);
    const { data } = await api.get(`/admin/sessions?${params.toString()}`);
    return data;
  },

  createSession: async (dto: object): Promise<Session> => {
    const { data } = await api.post("/admin/sessions", dto);
    return data;
  },

  updateSession: async (id: number, dto: object): Promise<Session> => {
    const { data } = await api.put(`/admin/sessions/${id}`, dto);
    return data;
  },

  deleteSession: async (id: number): Promise<void> => {
    await api.delete(`/admin/sessions/${id}`);
  },

  updateStatus: async (
    id: number,
    status: string,
    notes?: string,
  ): Promise<void> => {
    await api.put(`/admin/sessions/${id}/status`, { status, notes });
  },
};
