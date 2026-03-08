import api from "./api";

export const stripeService = {
  createPaymentIntent: async (confirmationCode: string) => {
    const { data } = await api.post("/payments/create-payment-intent", {
      confirmationCode,
    });
    return data as {
      clientSecret: string;
      amount: number;
      confirmationCode: string;
    };
  },
};
