// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// // Check if user is logged in
// const protect = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ message: 'Not authorized, no token' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select('-password');

//     if (!req.user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Token is invalid or expired' });
//   }
// };

// // Check role access
// const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: `Access denied. This route is for ${roles.join(', ')} only.` 
//       });
//     }
//     next();
//   };
// };

// module.exports = { protect, authorizeRoles };


import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Check if user is logged in
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = await User.findById(decoded.id)
      .select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ message: "User not found" });
    }

    if (req.user.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Your account has been blocked" });
    }

    if (req.user.role === "driver") {
      req.user.role = "ambulance_driver";
    }

    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Token is invalid or expired" });
  }
};

// Check role access
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This route is for ${roles.join(", ")} only.`,
      });
    }

    next();
  };
};

export { protect, authorizeRoles };
