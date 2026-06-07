import api from "./axios";

export const getDriverDashboard = () => {
  return api.get("/ambulance/dashboard");
};

export const requestAmbulance = (data) => {
  return api.post("/ambulance/requests", data);
};

export const getPatientAmbulanceRequests = () => {
  return api.get("/ambulance/requests/me");
};

export const getDriverJobs = () => {
  return api.get("/ambulance/jobs");
};

export const updateDriverJobStatus = (jobId, data) => {
  return api.patch(`/ambulance/jobs/${jobId}/status`, data);
};

export const updateDriverJobLocation = (jobId, data) => {
  return api.patch(`/ambulance/jobs/${jobId}/location`, data);
};

export const updateDriverProfile = (data) => {
  return api.put("/ambulance/me/profile", data);
};

export const activateDriverSubscription = (data) => {
  return api.post("/ambulance/me/subscription", data);
};
