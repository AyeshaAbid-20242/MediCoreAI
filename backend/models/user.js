const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'ambulance_driver', 'admin'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active'],
    default: 'pending'
  },

  // Doctor specific fields
  specialization: {
    type: String,
    default: null
  },
  experience: {
    type: Number,
    default: null
  },

  // Doctor & Driver shared fields
  licenseNumber: {
    type: String,
    default: null
  },

  // Driver specific fields
  vehicleNumber: {
    type: String,
    default: null
  },

  // For OTP (forget password)
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },

  // Track if user has logged in before
  isFirstLogin: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);