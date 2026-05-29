import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {
  sendDoctorRegistrationPassword,
  sendTempPassword,
  sendOTPEmail,
} from "../helper/emailHelper.js";
import {
  clearFailedLogins,
  recordFailedLogin,
} from "../middleware/rateLimitMiddleware.js";
import {
  cnicRegex,
  isStrongPassword,
  isValidEmail,
  normalizeEmail,
  phoneRegex,
  sendValidationError,
  toBoolean,
  toNumber,
  trimString,
} from "../helper/validators.js";

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
  if (role === "driver") return "ambulance_driver";
  return role;
};

const canUseEmailFallback = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.ALLOW_DEV_EMAIL_FALLBACK !== "false";

const emailFailureResponse = (res, message, emailError, tempPassword) => {
  return res.status(201).json({
    message,
    emailWarning:
      "Email delivery failed, so use the temporary password shown here. Fix Gmail App Password in backend/.env for real email delivery.",
    tempPassword,
    emailError,
  });
};

const sendRegistrationPasswordResponse = async ({
  res,
  email,
  name,
  role,
  tempPassword,
  successMessage,
  fallbackMessage,
}) => {
  const emailResult =
    role === "doctor"
      ? await sendDoctorRegistrationPassword(email, name, tempPassword)
      : await sendTempPassword(email, name, tempPassword);

  if (!emailResult.sent) {
    return emailFailureResponse(res, fallbackMessage, emailResult.error, tempPassword);
  }

  return res.status(201).json({ message: successMessage });
};

const register = async (req, res) => {
  try {
    const {
      name,
      fullName,
      email,
      password,
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

    const finalName = trimString(name || fullName);
    const finalRole = normalizeRole(role);
    const finalEmail = normalizeEmail(email);
    const finalLicenseNumber = trimString(
      licenseNumber || drivingLicenseNumber || pmdcNumber
    );
    const finalExperience = toNumber(experience);
    const finalDriverExperience = toNumber(driverExperience);
    const finalAge = toNumber(age);
    const finalPassword = trimString(password);
    const errors = [];

    if (!finalName || finalName.length < 2) errors.push("Name must be at least 2 characters.");
    if (!isValidEmail(finalEmail)) errors.push("A valid email is required.");
    if (finalPassword && !isStrongPassword(finalPassword)) {
      errors.push("Password must be at least 8 characters and include a letter and a number.");
    }

    if (!["patient", "doctor", "ambulance_driver"].includes(finalRole)) {
      errors.push("Invalid role.");
    }

    if (finalAge !== null && (finalAge < 0 || finalAge > 120)) {
      errors.push("Age must be between 0 and 120.");
    }

    if (mobileNumber && !phoneRegex.test(trimString(mobileNumber))) {
      errors.push("Mobile number format is invalid.");
    }

    if (cnic && !cnicRegex.test(trimString(cnic))) {
      errors.push("CNIC format is invalid.");
    }

    if (finalRole === "doctor") {
      if (!trimString(specialization) || finalExperience === null || !finalLicenseNumber) {
        errors.push("Please provide specialization, experience and PMDC/license number.");
      }

      if (finalExperience !== null && (finalExperience < 0 || finalExperience > 70)) {
        errors.push("Doctor experience must be between 0 and 70 years.");
      }
    }

    if (finalRole === "ambulance_driver") {
      if (!finalLicenseNumber || !trimString(vehicleNumber)) {
        errors.push("Please provide driving license number and vehicle number.");
      }

      if (
        finalDriverExperience !== null &&
        (finalDriverExperience < 0 || finalDriverExperience > 70)
      ) {
        errors.push("Driver experience must be between 0 and 70 years.");
      }
    }

    if (errors.length) return sendValidationError(res, errors);

    const existingUser = await User.findOne({ email: finalEmail });
    if (existingUser) {
      if (
        canUseEmailFallback() &&
        ["patient", "doctor"].includes(existingUser.role) &&
        existingUser.role === finalRole
      ) {
        const tempPassword = generateTempPassword();
        existingUser.password = await bcrypt.hash(tempPassword, 10);
        existingUser.isFirstLogin = true;
        await existingUser.save();

        return res.status(200).json({
          message:
            "Email is already registered. A new temporary password was created for this account.",
          emailWarning:
            "Email delivery is not working, so use the temporary password shown here.",
          tempPassword,
        });
      }

      return res.status(400).json({
        message: "Email already registered. Please login or use forgot password.",
      });
    }

    let status = "pending";
    let tempPassword = null;
    let hashedPassword = null;

    if (finalPassword) {
      status = finalRole === "patient" ? "active" : "pending";
      hashedPassword = await bcrypt.hash(finalPassword, 10);
    } else if (finalRole === "patient" || finalRole === "doctor") {
      status = "approved";
      if (finalRole === "doctor") status = "pending";
      tempPassword = generateTempPassword();
      hashedPassword = await bcrypt.hash(tempPassword, 10);
    } else {
      hashedPassword = await bcrypt.hash("placeholder", 10);
    }

    const user = await User.create({
      name: finalName,
      fullName: finalName,
      email: finalEmail,
      password: hashedPassword,
      role: finalRole,
      status,
      city: trimString(city) || null,
      age: finalAge,
      specialization: trimString(specialization) || null,
      experience: finalExperience,
      licenseNumber: finalLicenseNumber || null,
      pmdcNumber: trimString(pmdcNumber) || null,
      cnic: trimString(cnic) || null,
      mobileNumber: trimString(mobileNumber) || null,
      drivingLicenseNumber: trimString(drivingLicenseNumber) || null,
      vehicleNumber: trimString(vehicleNumber) || null,
      ambulanceType: trimString(ambulanceType) || null,
      driverExperience: finalDriverExperience,
      hasOxygen: toBoolean(hasOxygen),
      hasStretcher: toBoolean(hasStretcher),
      isFirstLogin: !finalPassword,
    });

    if (finalPassword) {
      const message =
        finalRole === "doctor" || finalRole === "ambulance_driver"
          ? "Registration successful! Please wait for admin approval."
          : "Registration successful! You can now login with your password.";

      return res.status(201).json({ message });
    }

    if (finalRole === "patient") {
      return sendRegistrationPasswordResponse({
        res,
        email: finalEmail,
        name: finalName,
        role: finalRole,
        tempPassword,
        successMessage: "Registration successful! Check your email for temporary password.",
        fallbackMessage: "Registration successful, but email delivery failed.",
      });
    }

    if (finalRole === "doctor") {
      return sendRegistrationPasswordResponse({
        res,
        email: finalEmail,
        name: finalName,
        role: finalRole,
        tempPassword,
        successMessage:
          "Registration successful! Password sent to email. Please wait for admin approval.",
        fallbackMessage:
          "Registration successful, but email delivery failed. Please wait for admin approval.",
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
    const finalEmail = normalizeEmail(email);

    if (!isValidEmail(finalEmail) || !password) {
      return sendValidationError(res, ["Valid email and password are required."]);
    }

    const user = await User.findOne({ email: finalEmail });

    if (!user) {
      recordFailedLogin(req);
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedUserRole = normalizeRole(user.role);
    if (user.role !== normalizedUserRole) {
      user.role = normalizedUserRole;
      await user.save();
    }

    if (normalizedUserRole === "doctor" && user.status === "pending") {
      return res.status(403).json({
        message: "Your doctor account is pending admin approval.",
      });
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

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account has been blocked",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailedLogin(req);
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    clearFailedLogins(req);

    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      user.status = "active";
      await user.save();
    }

    const token = generateToken(user._id, normalizedUserRole);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        role: normalizedUserRole,
        status: user.status,
        subscriptionStatus: user.subscriptionStatus,
        packageName: user.packageName,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
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
    const finalEmail = normalizeEmail(email);

    if (!isValidEmail(finalEmail)) {
      return sendValidationError(res, ["A valid email is required."]);
    }

    const user = await User.findOne({ email: finalEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const emailResult = await sendOTPEmail(finalEmail, user.name, otp);
    if (!emailResult.sent) {
      if (!canUseEmailFallback()) {
        return res.status(502).json({
          message:
            "Could not send OTP email. Fix EMAIL_USER and Gmail App Password in backend/.env.",
          error: emailResult.error,
        });
      }

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      return res.status(200).json({
        message: "Email delivery failed, so use the OTP shown here.",
        otp,
        emailWarning:
          "This OTP is shown only because email delivery is not working in development.",
        error: emailResult.error,
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

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
    const finalEmail = normalizeEmail(email);

    if (!isValidEmail(finalEmail) || !/^\d{6}$/.test(String(otp || ""))) {
      return sendValidationError(res, ["Valid email and 6-digit OTP are required."]);
    }

    const user = await User.findOne({ email: finalEmail });

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
    const finalEmail = normalizeEmail(email);

    if (!isValidEmail(finalEmail) || !/^\d{6}$/.test(String(otp || ""))) {
      return sendValidationError(res, ["Valid email and 6-digit OTP are required."]);
    }

    if (!isStrongPassword(newPassword)) {
      return sendValidationError(res, [
        "Password must be at least 8 characters and include a letter and a number.",
      ]);
    }

    const user = await User.findOne({ email: finalEmail });

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
