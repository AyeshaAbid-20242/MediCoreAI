const express = require('express');
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword
} = require('../controllers/AuthController');

const {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser
} = require('../controllers/AdminController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ==========================================
// Public Routes (No login required)
// ==========================================
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// ==========================================
// Admin Routes (Admin login required)
// ==========================================
router.get('/admin/pending', protect, authorizeRoles('admin'), getPendingUsers);
router.put('/admin/approve/:id', protect, authorizeRoles('admin'), approveUser);
router.put('/admin/reject/:id', protect, authorizeRoles('admin'), rejectUser);
router.get('/admin/all-users', protect, authorizeRoles('admin'), getAllUsers);
router.delete('/admin/delete/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;