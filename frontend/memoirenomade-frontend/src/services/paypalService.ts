import api from "./api";

export const paypalService = {
  createOrder: async (confirmationCode: string): Promise<string> => {
    const { data } = await api.post("/paypal/create-order", {
      confirmationCode,
    });
    return data.orderId;
  },

  captureOrder: async (
    orderId: string,
    confirmationCode: string,
  ): Promise<string> => {
    const { data } = await api.post("/paypal/capture-order", {
      orderId,
      confirmationCode,
    });
    return data.confirmationCode;
  },
};
