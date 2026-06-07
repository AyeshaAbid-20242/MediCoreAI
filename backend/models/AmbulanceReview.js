import mongoose from "mongoose";

const ambulanceReviewSchema = new mongoose.Schema(
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
    ambulanceJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AmbulanceJob",
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

ambulanceReviewSchema.index({ driverId: 1, createdAt: -1 });

const AmbulanceReview = mongoose.model("AmbulanceReview", ambulanceReviewSchema);

export default AmbulanceReview;
