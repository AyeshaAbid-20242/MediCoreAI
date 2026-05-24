import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "ambulance_driver", "admin"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active"],
      default: "pending",
    },
    city: {
      type: String,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },

    specialization: {
      type: String,
      default: null,
    },
    experience: {
      type: Number,
      default: null,
    },
    licenseNumber: {
      type: String,
      default: null,
    },
    pmdcNumber: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    availableDays: {
      type: [String],
      default: [],
    },
    availableTimeSlots: {
      type: [String],
      default: [],
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired"],
      default: "none",
    },
    packageName: {
      type: String,
      default: "",
    },
    subscriptionStart: {
      type: Date,
      default: null,
    },
    subscriptionEnd: {
      type: Date,
      default: null,
    },

    cnic: {
      type: String,
      default: null,
    },
    mobileNumber: {
      type: String,
      default: null,
    },
    drivingLicenseNumber: {
      type: String,
      default: null,
    },
    vehicleNumber: {
      type: String,
      default: null,
    },
    ambulanceType: {
      type: String,
      default: null,
    },
    driverExperience: {
      type: Number,
      default: null,
    },
    hasOxygen: {
      type: Boolean,
      default: false,
    },
    hasStretcher: {
      type: Boolean,
      default: false,
    },

    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
