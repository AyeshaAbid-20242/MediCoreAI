import mongoose from "mongoose";

const ambulanceJobSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    pickupLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    pickupLatitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    pickupLongitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    destination: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "active", "completed", "cancelled"],
      default: "requested",
    },
    fare: {
      type: Number,
      default: 0,
      min: 0,
    },
    driverLatitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },
    driverLongitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },
    driverLocationUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const AmbulanceJob = mongoose.model("AmbulanceJob", ambulanceJobSchema);

export default AmbulanceJob;
