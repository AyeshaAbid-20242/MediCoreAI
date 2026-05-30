import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const adminEmail = "admin@medicore.com";
    const adminPassword = "password1234/";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: "MediCore Admin",
        fullName: "MediCore Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        city: null,
        age: null,
        specialization: null,
        experience: null,
        licenseNumber: null,
        pmdcNumber: null,
        bio: "",
        consultationFee: 0,
        profileImageUrl: "",
        availableDays: [],
        availableTimeSlots: [],
        subscriptionStatus: "none",
        packageName: "",
        subscriptionStart: null,
        subscriptionEnd: null,
        cnic: null,
        mobileNumber: null,
        drivingLicenseNumber: null,
        vehicleNumber: null,
        ambulanceType: null,
        driverExperience: null,
        hasOxygen: false,
        hasStretcher: false,
        otp: null,
        otpExpiry: null,
        isFirstLogin: false,
      },
      { upsert: true, returnDocument: "after", runValidators: true }
    );

    console.log("Admin user is ready.");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
