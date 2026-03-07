import api from "./api";
import { Booking } from "@/types/booking.types";

export const bookingService = {
  getByConfirmationCode: async (code: string): Promise<Booking> => {
    const { data } = await api.get(`/bookings/${code}`);
    return data;
  },

  createBooking: async (dto: object): Promise<Booking> => {
    const { data } = await api.post("/bookings", dto);
    return data;
  },

  // Admin
  getAllBookings: async (filters?: {
    status?: string;
    tourId?: number;
    from?: string;
    to?: string;
  }): Promise<Booking[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.tourId) params.append("tourId", filters.tourId.toString());
    if (filters?.from) params.append("from", filters.from);
    if (filters?.to) params.append("to", filters.to);
    const { data } = await api.get(`/admin/bookings?${params.toString()}`);
    return data;
  },

  getBookingById: async (id: number): Promise<Booking> => {
    const { data } = await api.get(`/admin/bookings/${id}`);
    return data;
  },

  updateBooking: async (id: number, dto: object): Promise<Booking> => {
    const { data } = await api.put(`/admin/bookings/${id}`, dto);
    return data;
  },
};
