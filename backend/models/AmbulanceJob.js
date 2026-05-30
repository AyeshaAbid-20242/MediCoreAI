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
  },
  { timestamps: true }
);

const AmbulanceJob = mongoose.model("AmbulanceJob", ambulanceJobSchema);

export default AmbulanceJob;
