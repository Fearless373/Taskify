const express = require("express");
const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  getMe,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", requireAuth, resendVerification);
router.get("/me", requireAuth, getMe);

module.exports = router;
