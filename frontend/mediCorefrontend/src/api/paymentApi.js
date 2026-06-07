import api from "./axios";

export const createCheckoutSession = async (data) => {
  const res = await api.post("/payments/create-checkout-session", data);
  return res.data;
};

export const verifyPayment = async (sessionId) => {
  const res = await api.get(`/payments/verify?session_id=${sessionId}`);
  return res.data;
};

export const createAppointmentCheckout = async (appointmentId) => {
  const res = await api.post("/payments/create-appointment-checkout", { appointmentId });
  return res.data;
};

export const verifyAppointmentPayment = async (sessionId) => {
  const res = await api.get(`/payments/verify-appointment?session_id=${sessionId}`);
  return res.data;
};
