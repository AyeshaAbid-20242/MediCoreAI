import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { sendTempPassword, sendOTPEmail } from "../helper/emailHelper.js";

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + "@123";
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to backend/.env.");
  }

  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const normalizeRole = (role) => {
  if (role === "Patient") return "patient";
  if (role === "Doctor") return "doctor";
  if (role === "AmbulanceDriver") return "ambulance_driver";
  return role;
};

const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      role,
      city,
      age,
      specialization,
      experience,
      pmdcNumber,
      cnic,
      mobileNumber,
      drivingLicenseNumber,
      licenseNumber,
      vehicleNumber,
      ambulanceType,
      driverExperience,
      hasOxygen,
      hasStretcher,
    } = req.body;

    const finalName = name || fullName;
    const finalRole = normalizeRole(role);
    const finalLicenseNumber = licenseNumber || drivingLicenseNumber || pmdcNumber;

    if (!finalName || !email || !finalRole) {
      return res.status(400).json({
        message: "Name, email and role are required",
      });
    }

    if (!["patient", "doctor", "ambulance_driver"].includes(finalRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    if (finalRole === "doctor") {
      if (!specialization || !experience || !finalLicenseNumber) {
        return res.status(400).json({
          message: "Please provide specialization, experience and PMDC/license number",
        });
      }
    }

    if (finalRole === "ambulance_driver") {
      if (!finalLicenseNumber || !vehicleNumber) {
        return res.status(400).json({
          message: "Please provide driving license number and vehicle number",
        });
      }
    }

    let status = "pending";
    let tempPassword = null;
    let hashedPassword = null;

    if (finalRole === "patient") {
      status = "approved";
      tempPassword = generateTempPassword();
      hashedPassword = await bcrypt.hash(tempPassword, 10);
    } else {
      hashedPassword = await bcrypt.hash("placeholder", 10);
    }

    const user = await User.create({
      name: finalName,
      fullName: finalName,
      email,
      password: hashedPassword,
      role: finalRole,
      status,
      city: city || null,
      age: age || null,
      specialization: specialization || null,
      experience: experience ? Number(experience) : null,
      licenseNumber: finalLicenseNumber || null,
      pmdcNumber: pmdcNumber || null,
      cnic: cnic || null,
      mobileNumber: mobileNumber || null,
      drivingLicenseNumber: drivingLicenseNumber || null,
      vehicleNumber: vehicleNumber || null,
      ambulanceType: ambulanceType || null,
      driverExperience: driverExperience ? Number(driverExperience) : null,
      hasOxygen: Boolean(hasOxygen),
      hasStretcher: Boolean(hasStretcher),
    });

    if (finalRole === "patient") {
      await sendTempPassword(email, finalName, tempPassword);

      return res.status(201).json({
        message: "Registration successful! Check your email for temporary password.",
      });
    }

    return res.status(201).json({
      message: "Registration successful! Please wait for admin approval.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Your account is pending admin approval",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Your account has been rejected by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      user.status = "active";
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export { register, login, forgotPassword, verifyOTP, resetPassword };
