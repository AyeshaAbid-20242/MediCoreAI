import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    limit: {
      type: Number,
      required: true,
      min: 1,
    },
    resetAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const AiUsage = mongoose.model("AiUsage", aiUsageSchema);

export default AiUsage;
