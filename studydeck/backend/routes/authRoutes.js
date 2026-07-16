const express = require("express");
const { signup, signin, forgotPassword, resetPassword, getMe } = require("../controllers/authController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, getMe);

module.exports = router;
