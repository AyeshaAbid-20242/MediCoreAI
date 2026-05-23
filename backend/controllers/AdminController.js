// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const { sendTempPassword } = require('../helper/emailHelper');

// // Generate random temporary password
// const generateTempPassword = () => {
//   return Math.random().toString(36).slice(-8) + '@123';
// };

// // ==========================================
// // @route   GET /api/admin/pending
// // @access  Admin only
// // ==========================================
// const getPendingUsers = async (req, res) => {
//   try {
//     const pendingUsers = await User.find({ status: 'pending' }).select('-password');

//     res.status(200).json({
//       message: 'Pending users fetched successfully',
//       count: pendingUsers.length,
//       users: pendingUsers
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   PUT /api/admin/approve/:id
// // @access  Admin only
// // ==========================================
// const approveUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.status === 'approved' || user.status === 'active') {
//       return res.status(400).json({ message: 'User is already approved' });
//     }

//     // Generate temp password
//     const tempPassword = generateTempPassword();
//     const hashedPassword = await bcrypt.hash(tempPassword, 10);

//     // Update user
//     user.password = hashedPassword;
//     user.status = 'approved';
//     user.isFirstLogin = true;
//     await user.save();

//     // Send temp password to user via email
//     await sendTempPassword(user.email, user.name, tempPassword);

//     res.status(200).json({
//       message: `${user.name} has been approved. Temporary password sent to their email.`
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   PUT /api/admin/reject/:id
// // @access  Admin only
// // ==========================================
// const rejectUser = async (req, res) => {
//   try {
//     const { reason } = req.body;

//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.status === 'rejected') {
//       return res.status(400).json({ message: 'User is already rejected' });
//     }

//     user.status = 'rejected';
//     await user.save();

//     res.status(200).json({
//       message: `${user.name} has been rejected.`
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   GET /api/admin/all-users
// // @access  Admin only
// // ==========================================
// const getAllUsers = async (req, res) => {
//   try {
//     const { role, status } = req.query;

//     // Build filter
//     let filter = { role: { $ne: 'admin' } };
//     if (role) filter.role = role;
//     if (status) filter.status = status;

//     const users = await User.find(filter).select('-password');

//     res.status(200).json({
//       message: 'Users fetched successfully',
//       count: users.length,
//       users
//     });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // ==========================================
// // @route   DELETE /api/admin/delete/:id
// // @access  Admin only
// // ==========================================
// const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     if (user.role === 'admin') {
//       return res.status(403).json({ message: 'Cannot delete admin account' });
//     }

//     await User.findByIdAndDelete(req.params.id);

//     res.status(200).json({ message: `${user.name} has been deleted successfully` });

//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// module.exports = { getPendingUsers, approveUser, rejectUser, getAllUsers, deleteUser };



import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { sendTempPassword } from "../helper/emailHelper.js";

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8) + "@123";
};

const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" }).select("-password");

    res.status(200).json({
      message: "Pending users fetched successfully",
      count: pendingUsers.length,
      users: pendingUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status === "approved" || user.status === "active") {
      return res.status(400).json({ message: "User is already approved" });
    }

    const tempPassword = generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.status = "approved";
    user.isFirstLogin = true;
    await user.save();

    await sendTempPassword(user.email, user.name, tempPassword);

    res.status(200).json({
      message: `${user.name} has been approved. Temporary password sent to their email.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status === "rejected") {
      return res.status(400).json({ message: "User is already rejected" });
    }

    user.status = "rejected";
    await user.save();

    res.status(200).json({
      message: `${user.name} has been rejected.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;

    let filter = { role: { $ne: "admin" } };

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin account" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: `${user.name} has been deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
};