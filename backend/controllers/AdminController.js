import bcrypt from "bcryptjs";
import User from "../models/user.js";
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "approved" || user.status === "active") {
      return res.status(400).json({ message: "User is already approved" });
    }

    const tempPassword = generateTempPassword();

    user.password = await bcrypt.hash(tempPassword, 10);
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
    const filter = { role: { $ne: "admin" } };

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

export { getPendingUsers, approveUser, rejectUser, getAllUsers, deleteUser };
