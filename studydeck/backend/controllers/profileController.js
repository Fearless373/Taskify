const crypto = require("crypto");
const validator = require("validator");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");

const EDITABLE_FIELDS = ["fullName", "course", "phoneNumber", "email", "profilePicture"];

// POST /api/profile/update  (auth required)
async function requestProfileUpdate(req, res) {
  try {
    const student = await Student.findById(req.studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const changes = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== student[field]) {
        changes[field] = req.body[field];
      }
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ message: "No changes were provided" });
    }

    if (changes.email) {
      if (!validator.isEmail(changes.email)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }
      const existing = await Student.findOne({ email: changes.email.toLowerCase(), _id: { $ne: student._id } });
      if (existing) {
        return res.status(409).json({ message: "That email is already in use by another account" });
      }
      changes.email = changes.email.toLowerCase();
    }

    if (changes.profilePicture && changes.profilePicture.length > 3_000_000) {
      return res.status(400).json({ message: "Profile picture is too large. Please use a smaller image." });
    }

    const updateToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(updateToken).digest("hex");

    student.pendingUpdate = changes;
    student.updateToken = hashedToken;
    student.updateTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await student.save();

    const destinationEmail = changes.email || student.email;
    const confirmUrl = `${process.env.CLIENT_URL}/confirm-update?token=${updateToken}&id=${student._id}`;

    const changeSummary = summarizeChanges(changes);

    await sendEmail({
      to: destinationEmail,
      subject: "Confirm your StudyDeck profile update",
      html: `<p>Hi ${student.fullName},</p><p>You requested to update your profile: ${changeSummary}.</p><p>Confirm this change by clicking the link below (expires in 1 hour):</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
    });

    return res.json({
      message: `A confirmation link has been sent to ${destinationEmail}. Your profile will update once you confirm.`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not process your profile update" });
  }
}

// POST /api/profile/confirm  (public - the token itself is the credential)
async function confirmProfileUpdate(req, res) {
  try {
    const { id, token } = req.body;
    if (!id || !token) {
      return res.status(400).json({ message: "Missing confirmation details" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const student = await Student.findOne({
      _id: id,
      updateToken: hashedToken,
      updateTokenExpires: { $gt: new Date() },
    });

    if (!student || !student.pendingUpdate) {
      return res.status(400).json({ message: "Confirmation link is invalid or has expired" });
    }

    const changes = student.pendingUpdate;
    for (const field of EDITABLE_FIELDS) {
      if (changes[field] !== undefined) {
        student[field] = changes[field];
      }
    }
    if (changes.email) {
      student.isEmailVerified = true;
    }

    student.pendingUpdate = null;
    student.updateToken = undefined;
    student.updateTokenExpires = undefined;
    await student.save();

    return res.json({ message: "Your profile has been updated", student: student.toSafeObject() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not confirm your profile update" });
  }
}

function summarizeChanges(changes) {
  const labels = {
    fullName: "full name",
    course: "course",
    phoneNumber: "phone number",
    email: "email address",
    profilePicture: "profile picture",
  };
  return Object.keys(changes)
    .map((key) => labels[key] || key)
    .join(", ");
}

module.exports = { requestProfileUpdate, confirmProfileUpdate };
