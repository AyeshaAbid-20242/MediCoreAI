import api from "./axios";

export const createReview = (payload) => {
  return api.post("/reviews", payload);
};

export const createAmbulanceReview = (payload) => {
  return api.post("/reviews/ambulance", payload);
};

export const getDoctorReviews = () => {
  return api.get("/reviews/me");
};

export const getDriverReviews = () => {
  return api.get("/reviews/driver/me");
};

export const getPublicDoctorReviews = (doctorId) => {
  return api.get(`/reviews/doctors/${doctorId}`);
};

export const getPublicDriverReviews = (driverId) => {
  return api.get(`/reviews/drivers/${driverId}`);
};
