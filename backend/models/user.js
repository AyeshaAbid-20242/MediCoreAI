import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    fullName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
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
      enum: ["pending", "approved", "rejected", "active", "blocked"],
      default: "pending",
    },
    city: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },
    age: {
      type: Number,
      default: null,
      min: 0,
      max: 120,
    },

    specialization: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
    },
    experience: {
      type: Number,
      default: null,
      min: 0,
      max: 70,
    },
    licenseNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: 60,
    },
    pmdcNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: 60,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
    },
    profileImageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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
      trim: true,
      maxlength: 40,
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
      trim: true,
      maxlength: 15,
    },
    mobileNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: 20,
    },
    drivingLicenseNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: 60,
    },
    vehicleNumber: {
      type: String,
      default: null,
      trim: true,
      maxlength: 30,
    },
    ambulanceType: {
      type: String,
      default: null,
      trim: true,
      maxlength: 60,
    },
    driverExperience: {
      type: Number,
      default: null,
      min: 0,
      max: 70,
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
