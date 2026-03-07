export interface TourImage {
  id: number;
  imageUrl: string;
  order: number;
}

export interface TourSummary {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  mainImageUrl: string | null;
  sessionCount: number;
  availableSpots: number;
}

export interface TourDetail {
  id: number;
  name: string;
  description: string;
  includes: string | null;
  notIncludes: string | null;
  isActive: boolean;
  isFeatured: boolean;
  mainImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  images: TourImage[];
}
