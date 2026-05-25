import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["doctor", "ambulance_driver"],
    required: true,
    unique: true,
  },
  basicMonthly: { type: Number, default: 999 },
  basicYearly: { type: Number, default: 9999 },
  professionalMonthly: { type: Number, default: 2999 },
  professionalYearly: { type: Number, default: 29999 },
  premiumMonthly: { type: Number, default: 4999 },
  premiumYearly: { type: Number, default: 49999 },
}, { timestamps: true });

const SubscriptionPlan = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

export default SubscriptionPlan;