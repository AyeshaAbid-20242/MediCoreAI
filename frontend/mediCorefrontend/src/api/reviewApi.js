import api from "./axios";

export const createReview = (payload) => {
  return api.post("/reviews", payload);
};

export const getDoctorReviews = () => {
  return api.get("/reviews/me");
};

export const getPublicDoctorReviews = (doctorId) => {
  return api.get(`/reviews/doctors/${doctorId}`);
};
