import axios from "axios";

const BASE_URL = "http://localhost:5000/api/payments";

const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const createCheckoutSession = async (data) => {
  const res = await axios.post(`${BASE_URL}/create-checkout-session`, data, { headers: headers() });
  return res.data;
};

export const verifyPayment = async (sessionId) => {
  const res = await axios.get(`${BASE_URL}/verify?session_id=${sessionId}`, { headers: headers() });
  return res.data;
};

export const createAppointmentCheckout = async (appointmentId) => {
  const res = await axios.post(
    `${BASE_URL}/create-appointment-checkout`,
    { appointmentId },
    { headers: headers() }
  );
  return res.data;
};

export const verifyAppointmentPayment = async (sessionId) => {
  const res = await axios.get(
    `${BASE_URL}/verify-appointment?session_id=${sessionId}`,
    { headers: headers() }
  );
  return res.data;
};