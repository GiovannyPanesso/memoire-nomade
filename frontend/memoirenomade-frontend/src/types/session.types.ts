export interface SessionPricing {
  id: number;
  label: string;
  price: number;
  type: "group" | "child" | "extra";
  minPersons: number | null;
  maxPersons: number | null;
}

export interface Session {
  id: number;
  tourId: number;
  tourName: string;
  date: string; // "2026-06-15"
  time: string; // "18:00:00"
  availableSpots: number;
  includesSeineCruise: boolean;
  status: string;
  pricings: SessionPricing[];
}
