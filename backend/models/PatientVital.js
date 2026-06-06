import mongoose from "mongoose";

const patientVitalSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      min: 0,
      default: null,
    },
    bloodPressureSystolic: {
      type: Number,
      min: 0,
      default: null,
    },
    bloodPressureDiastolic: {
      type: Number,
      min: 0,
      default: null,
    },
    oxygenSaturation: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    temperatureCelsius: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    measuredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const PatientVital = mongoose.model("PatientVital", patientVitalSchema);

export default PatientVital;
