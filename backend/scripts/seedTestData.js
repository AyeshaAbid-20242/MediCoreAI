import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import Appointment from "../models/Appointment.js";
import AmbulanceJob from "../models/AmbulanceJob.js";
import MedicalRecord from "../models/MedicalRecord.js";
import PatientVital from "../models/PatientVital.js";
import Prescription from "../models/Prescription.js";
import Review from "../models/Review.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
  quiet: true,
});

const password = "Password123";
const now = new Date();
const addDays = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const seedUser = async (email, data, hashedPassword) => {
  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        ...data,
        email,
        password: hashedPassword,
        isFirstLogin: false,
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await seedUser("admin@medicore.test", {
    name: "MediCore Admin",
    fullName: "MediCore Admin",
    role: "admin",
    status: "active",
    city: "Gujranwala",
  }, hashedPassword);

  const patient = await seedUser("patient@medicore.test", {
    name: "Ayesha Patient",
    fullName: "Ayesha Patient",
    role: "patient",
    status: "active",
    city: "Gujranwala",
    age: 28,
    mobileNumber: "03083460558",
    latitude: 32.1877,
    longitude: 74.1945,
  }, hashedPassword);

  const doctor = await seedUser("doctor@medicore.test", {
    name: "Dr. Sara Khan",
    fullName: "Dr. Sara Khan",
    role: "doctor",
    status: "approved",
    city: "Gujranwala",
    specialization: "Cardiology",
    experience: 9,
    licenseNumber: "PMDC-TEST-1024",
    pmdcNumber: "PMDC-TEST-1024",
    clinicName: "MediCore Heart Clinic",
    clinicAddress: "Satellite Town, Gujranwala",
    latitude: 32.1715,
    longitude: 74.1883,
    bio: "Cardiology consultant focused on preventive heart care and virtual follow-ups.",
    consultationFee: 2500,
    mobileNumber: "03001234567",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["10:00", "13:30", "18:00"],
    subscriptionStatus: "active",
    packageName: "Professional",
    subscriptionStart: addDays(-10),
    subscriptionEnd: addDays(80),
  }, hashedPassword);

  const driver = await seedUser("driver@medicore.test", {
    name: "Usman Shahid",
    fullName: "Usman Shahid",
    role: "ambulance_driver",
    status: "approved",
    city: "Gujranwala",
    mobileNumber: "03004567890",
    latitude: 32.1849,
    longitude: 74.2011,
    licenseNumber: "DL-AMB-9081",
    drivingLicenseNumber: "DL-AMB-9081",
    vehicleNumber: "LEA-1122",
    ambulanceType: "Advanced Life Support",
    driverExperience: 6,
    hasOxygen: true,
    hasStretcher: true,
    subscriptionStatus: "active",
    packageName: "Professional",
    subscriptionStart: addDays(-5),
    subscriptionEnd: addDays(85),
  }, hashedPassword);

  await SubscriptionPlan.findOneAndUpdate(
    { role: "doctor" },
    {
      role: "doctor",
      basicMonthly: 999,
      basicYearly: 9999,
      professionalMonthly: 2999,
      professionalYearly: 29999,
      premiumMonthly: 4999,
      premiumYearly: 49999,
    },
    { upsert: true, runValidators: true }
  );

  await SubscriptionPlan.findOneAndUpdate(
    { role: "ambulance_driver" },
    {
      role: "ambulance_driver",
      basicMonthly: 799,
      basicYearly: 7999,
      professionalMonthly: 1999,
      professionalYearly: 19999,
      premiumMonthly: 3499,
      premiumYearly: 34999,
    },
    { upsert: true, runValidators: true }
  );

  await Promise.all([
    Appointment.deleteMany({ patientId: patient._id, doctorId: doctor._id }),
    AmbulanceJob.deleteMany({ patientId: patient._id, driverId: driver._id }),
    MedicalRecord.deleteMany({ patientId: patient._id }),
    PatientVital.deleteMany({ patientId: patient._id }),
    Prescription.deleteMany({ patientId: patient._id }),
  ]);

  const completedAppointment = await Appointment.create({
    patientId: patient._id,
    doctorId: doctor._id,
    consultationFee: doctor.consultationFee,
    paymentStatus: "paid",
    appointmentStatus: "completed",
    patientNotes: "Follow-up after chest discomfort and high pulse readings.",
    zoomLink: "https://meet.google.com/test-medicore",
    appointmentDate: addDays(-3),
    appointmentTime: "10:00",
  });

  await Appointment.create([
    {
      patientId: patient._id,
      doctorId: doctor._id,
      consultationFee: doctor.consultationFee,
      paymentStatus: "paid",
      appointmentStatus: "accepted",
      patientNotes: "Review latest vitals and medication response.",
      zoomLink: "https://meet.google.com/test-followup",
      appointmentDate: addDays(2),
      appointmentTime: "13:30",
    },
    {
      patientId: patient._id,
      doctorId: doctor._id,
      consultationFee: doctor.consultationFee,
      paymentStatus: "pending",
      appointmentStatus: "requested",
      patientNotes: "Need consultation for irregular heartbeat symptoms.",
      appointmentDate: addDays(5),
      appointmentTime: "18:00",
    },
  ]);

  await Review.findOneAndUpdate(
    { appointmentId: completedAppointment._id },
    {
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentId: completedAppointment._id,
      rating: 5,
      comment: "Clear advice, professional follow-up, and very helpful consultation.",
    },
    { upsert: true, runValidators: true }
  );

  await AmbulanceJob.create([
    {
      patientId: patient._id,
      driverId: driver._id,
      patientName: patient.name,
      contactNumber: patient.mobileNumber,
      pickupLocation: "UET KSK Hostel A",
      pickupLatitude: patient.latitude,
      pickupLongitude: patient.longitude,
      destination: "City Hospital Gujranwala",
      notes: "Demo requested ambulance job for testing patient and driver dashboards.",
      status: "requested",
      fare: 0,
    },
    {
      patientId: patient._id,
      driverId: driver._id,
      patientName: patient.name,
      contactNumber: patient.mobileNumber,
      pickupLocation: "Satellite Town",
      pickupLatitude: 32.1786,
      pickupLongitude: 74.1851,
      destination: "MediCore Heart Clinic",
      notes: "Completed demo ambulance transfer.",
      status: "completed",
      fare: 1800,
    },
  ]);

  await PatientVital.create([
    {
      patientId: patient._id,
      heartRate: 82,
      bloodPressureSystolic: 122,
      bloodPressureDiastolic: 79,
      oxygenSaturation: 98,
      temperatureCelsius: 36.8,
      notes: "Morning reading",
      measuredAt: addDays(-4),
    },
    {
      patientId: patient._id,
      heartRate: 88,
      bloodPressureSystolic: 126,
      bloodPressureDiastolic: 82,
      oxygenSaturation: 97,
      temperatureCelsius: 37,
      notes: "After light walk",
      measuredAt: addDays(-2),
    },
    {
      patientId: patient._id,
      heartRate: 78,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      oxygenSaturation: 99,
      temperatureCelsius: 36.7,
      notes: "Stable",
      measuredAt: addDays(-1),
    },
  ]);

  await MedicalRecord.create([
    {
      patientId: patient._id,
      doctorId: doctor._id,
      title: "Cardiology Follow-up",
      recordType: "consultation",
      department: "Cardiology",
      summary: "Symptoms improved. Continue monitoring blood pressure and pulse.",
      status: "completed",
      recordDate: addDays(-3),
    },
    {
      patientId: patient._id,
      doctorId: doctor._id,
      title: "Lipid Profile Review",
      recordType: "lab_test",
      department: "Pathology",
      summary: "Cholesterol profile reviewed during virtual consultation.",
      status: "reviewed",
      recordDate: addDays(-6),
    },
  ]);

  await Prescription.create([
    {
      patientId: patient._id,
      doctorId: doctor._id,
      medicine: "Atorvastatin",
      dosage: "10 mg",
      schedule: "Once daily at night",
      duration: "30 days",
      instructions: "Take after dinner and avoid missing doses.",
      status: "active",
      prescribedAt: addDays(-3),
    },
    {
      patientId: patient._id,
      doctorId: doctor._id,
      medicine: "Aspirin",
      dosage: "75 mg",
      schedule: "Once daily",
      duration: "14 days",
      instructions: "Take only if advised and stop if bleeding symptoms occur.",
      status: "completed",
      prescribedAt: addDays(-20),
    },
  ]);

  console.log("MediCore test data seeded successfully.");
  console.log("Login accounts:");
  console.log(`Admin: admin@medicore.test / ${password}`);
  console.log(`Patient: patient@medicore.test / ${password}`);
  console.log(`Doctor: doctor@medicore.test / ${password}`);
  console.log(`Ambulance driver: driver@medicore.test / ${password}`);
  console.log("Seed ids:", {
    admin: admin._id.toString(),
    patient: patient._id.toString(),
    doctor: doctor._id.toString(),
    driver: driver._id.toString(),
  });
};

run()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
