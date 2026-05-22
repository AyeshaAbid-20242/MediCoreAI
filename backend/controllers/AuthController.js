const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendTempPassword, sendOTPEmail } = require('../helper/emailHelper');

// Generate random temporary password
const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + '@123';
};

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


// @route   POST /api/auth/register
// @access  Public

const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experience, licenseNumber, vehicleNumber } = req.body;

    // Validate role
    if (!['patient', 'doctor', 'ambulance_driver'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Doctor specific validation
    if (role === 'doctor') {
      if (!specialization || !experience || !licenseNumber) {
        return res.status(400).json({ message: 'Please provide specialization, experience and license number' });
      }
    }

    // Driver specific validation
    if (role === 'ambulance_driver') {
      if (!licenseNumber || !vehicleNumber) {
        return res.status(400).json({ message: 'Please provide license number and vehicle number' });
      }
    }

    // Patient registers and gets temp password immediately
    // Doctor and Driver need admin approval first
    let status = 'pending';
    let tempPassword = null;
    let hashedPassword = null;

    if (role === 'patient') {
      status = 'approved';
      tempPassword = generateTempPassword();
      hashedPassword = await bcrypt.hash(tempPassword, 10);
    } else {
      // Placeholder password for doctor/driver until admin approves
      hashedPassword = await bcrypt.hash('placeholder', 10);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status,
      specialization: specialization || null,
      experience: experience || null,
      licenseNumber: licenseNumber || null,
      vehicleNumber: vehicleNumber || null
    });

    // Send temp password to patient immediately
    if (role === 'patient') {
      await sendTempPassword(email, name, tempPassword);
      return res.status(201).json({
        message: 'Registration successful! Check your email for temporary password.'
      });
    }

    // Doctor and Driver
    return res.status(201).json({
      message: 'Registration successful! Please wait for admin approval.'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   POST /api/auth/login
// @access  Public

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if pending
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }

    // Check if rejected
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account has been rejected by admin' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update status to active on first login
    if (user.isFirstLogin) {
      user.isFirstLogin = false;
      user.status = 'active';
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   POST /api/auth/forgot-password
// @access  Public

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({ message: 'OTP sent to your email' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @route   POST /api/auth/verify-otp
// @access  Public

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/reset-password
// @access  Public

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check OTP again for security
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, forgotPassword, verifyOTP, resetPassword };