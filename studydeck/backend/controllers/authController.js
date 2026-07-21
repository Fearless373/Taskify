const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");

function signToken(student) {
  return jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { fullName, studentId, phoneNumber, course, email, password, confirmPassword } = req.body;

    if (!fullName || !studentId || !phoneNumber || !course || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirmation do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await Student.findOne({ $or: [{ email: email.toLowerCase() }, { studentId }] });
    if (existing) {
      return res.status(409).json({ message: "An account with this email or student ID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(emailVerificationToken).digest("hex");

    const student = await Student.create({
      fullName,
      studentId,
      phoneNumber,
      course,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}&id=${student._id}`;
    try {
      await sendEmail({
        to: student.email,
        subject: "Verify your StudyDeck account",
        html: `<p>Hi ${student.fullName},</p><p>Welcome to StudyDeck. Please verify your account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
    } catch (err) {
      console.error("Failed to send verification email:", err.message);
    }

    const token = signToken(student);
    return res.status(201).json({ token, student: student.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong during signup" });
  }
}

// POST /api/auth/signin
async function signin(req, res) {
  try {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      return res.status(400).json({ message: "Student ID and password are required" });
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(401).json({ message: "Invalid student ID or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid student ID or password" });
    }

    const token = signToken(student);
    return res.json({ token, student: student.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong during sign in" });
  }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const student = await Student.findOne({ email: email.toLowerCase() });
    // Respond the same way whether or not the account exists, to avoid leaking which emails are registered
    if (!student) {
      return res.json({ message: "If that email is registered, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiresMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 60);

    student.resetPasswordToken = hashedToken;
    student.resetPasswordExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
    await student.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${student._id}`;
    await sendEmail({
      to: student.email,
      subject: "Reset your StudyDeck password",
      html: `<p>Hi ${student.fullName},</p><p>You requested a password reset. This link expires in ${expiresMinutes} minutes:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
    });

    return res.json({ message: "If that email is registered, a reset link has been sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong sending the reset email" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { id, token, password, confirmPassword } = req.body;
    if (!id || !token || !password || !confirmPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirmation do not match" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const student = await Student.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!student) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    student.password = await bcrypt.hash(password, 12);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();

    return res.json({ message: "Password has been reset successfully. You can now sign in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong resetting the password" });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  const student = await Student.findById(req.studentId);
  if (!student) return res.status(404).json({ message: "Student not found" });
  return res.json({ student: student.toSafeObject() });
}

// POST /api/auth/verify-email
async function verifyEmail(req, res) {
  try {
    const { id, token } = req.body;
    if (!id || !token) {
      return res.status(400).json({ message: "Missing verification details" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const student = await Student.findOne({
      _id: id,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!student) {
      return res.status(400).json({ message: "Verification link is invalid or has expired" });
    }

    student.isEmailVerified = true;
    student.emailVerificationToken = undefined;
    student.emailVerificationExpires = undefined;
    await student.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong verifying your email" });
  }
}

// POST /api/auth/resend-verification
async function resendVerification(req, res) {
  try {
    const student = await Student.findById(req.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (student.isEmailVerified) {
      return res.json({ message: "Your email is already verified" });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(emailVerificationToken).digest("hex");

    student.emailVerificationToken = hashedVerificationToken;
    student.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await student.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}&id=${student._id}`;
    await sendEmail({
      to: student.email,
      subject: "Verify your StudyDeck account",
      html: `<p>Hi ${student.fullName},</p><p>Please verify your account by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not resend verification email" });
  }
}

module.exports = { signup, signin, forgotPassword, resetPassword, getMe, verifyEmail, resendVerification };
