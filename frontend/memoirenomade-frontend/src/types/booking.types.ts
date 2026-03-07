export interface CartItem {
  sessionId: number;
  sessionPricingId: number;
  tourName: string;
  tourImageUrl: string | null;
  sessionDate: string;
  sessionTime: string;
  includesSeineCruise: boolean;
  pricingLabel: string;
  pricingPrice: number;
  numAdults: number;
  numChildren: number;
  childPricePerChild: number;
  subtotal: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  country: string;
}

export interface BookingItem {
  id: number;
  sessionId: number;
  tourName: string;
  sessionDate: string;
  sessionTime: string;
  includesSeineCruise: boolean;
  pricingLabel: string;
  pricingPrice: number;
  numAdults: number;
  numChildren: number;
  subtotal: number;
}

export interface Booking {
  id: number;
  confirmationCode: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
  };
  totalAmount: number;
  status: string;
  bookingDate: string;
  items: BookingItem[];
  statusHistory: {
    previousStatus: string;
    newStatus: string;
    changedAt: string;
    changedBy: string;
    notes: string | null;
  }[];
  payments: {
    id: number;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    refundAmount: number | null;
    refundDate: string | null;
    createdAt: string;
  }[];
}
