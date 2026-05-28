import axios from "axios";

const BASE_URL = "http://localhost:5000/api/ambulance";

const getToken = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${getToken()}` });

export const getDriverDashboard = async () => {
  const res = await axios.get(`${BASE_URL}/dashboard`, { headers: headers() });
  return res;
};

export const updateDriverProfile = async (data) => {
  const res = await axios.put(`${BASE_URL}/profile`, data, { headers: headers() });
  return res;
};

export const activateDriverSubscription = async (data) => {
  const res = await axios.post(`${BASE_URL}/subscription`, data, { headers: headers() });
  return res;
};