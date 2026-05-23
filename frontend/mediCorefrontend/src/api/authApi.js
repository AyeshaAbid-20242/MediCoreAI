import api from "./axios";

export const loginUser = (credentials) => {
  return api.post("/auth/login", credentials);
};

export const registerUser = (payload) => {
  return api.post("/auth/register", payload);
};

export const sendForgotPasswordOtp = (email) => {
  return api.post("/auth/forgot-password", { email });
};

export const verifyPasswordOtp = (email, otp) => {
  return api.post("/auth/verify-otp", { email, otp });
};

export const resetPassword = ({ email, otp, newPassword }) => {
  return api.post("/auth/reset-password", { email, otp, newPassword });
};

export const getPatientProviders = () => {
  return api.get("/auth/patient/providers");
};
