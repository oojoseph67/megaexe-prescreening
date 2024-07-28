const express = require("express");
const router = express.Router();

const {
  login,
  register,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { authenticateUser } = require("../middleware/authentication");

router.post("/login", login);
router.post("/register", register);
router.delete("/logout", authenticateUser, logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
