import api from "./api";
import { TourSummary, TourDetail } from "@/types/tour.types";

export const tourService = {
  getActiveTours: async (): Promise<TourSummary[]> => {
    const { data } = await api.get("/tours");
    return data;
  },

  getFeaturedTours: async (): Promise<TourSummary[]> => {
    const { data } = await api.get("/tours/featured");
    return data;
  },

  getTourById: async (id: number): Promise<TourDetail> => {
    const { data } = await api.get(`/tours/${id}`);
    return data;
  },

  // Admin
  getAllTours: async (): Promise<TourSummary[]> => {
    const { data } = await api.get("/admin/tours");
    return data;
  },

  createTour: async (dto: Partial<TourDetail>): Promise<TourDetail> => {
    const { data } = await api.post("/admin/tours", dto);
    return data;
  },

  updateTour: async (
    id: number,
    dto: Partial<TourDetail>,
  ): Promise<TourDetail> => {
    const { data } = await api.put(`/admin/tours/${id}`, dto);
    return data;
  },

  deleteTour: async (id: number): Promise<void> => {
    await api.delete(`/admin/tours/${id}`);
  },

  toggleFeatured: async (id: number): Promise<void> => {
    await api.put(`/admin/tours/${id}/featured`);
  },

  addImage: async (tourId: number, imageUrl: string, order: number) => {
    const { data } = await api.post(`/admin/tours/${tourId}/images`, {
      imageUrl,
      order,
    });
    return data;
  },

  deleteImage: async (tourId: number, imageId: number): Promise<void> => {
    await api.delete(`/admin/tours/${tourId}/images/${imageId}`);
  },
};
