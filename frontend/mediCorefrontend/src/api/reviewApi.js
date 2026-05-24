import api from "./axios";

export const createReview = (payload) => {
  return api.post("/reviews", payload);
};

export const getDoctorReviews = () => {
  return api.get("/reviews/doctor/me");
};

export const getPublicDoctorReviews = (doctorId) => {
  return api.get(`/reviews/doctor/${doctorId}`);
};
