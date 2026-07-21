const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // Base64 data URI of a resized profile picture (kept small by the frontend before upload)
    profilePicture: { type: String, default: "" },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    // Holds a proposed profile change until the student confirms it by email
    pendingUpdate: { type: mongoose.Schema.Types.Mixed, default: null },
    updateToken: { type: String },
    updateTokenExpires: { type: Date },
  },
  { timestamps: true }
);

// Never send password or tokens back in API responses
studentSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.resetPasswordToken;
  delete obj.updateToken;
  return obj;
};

module.exports = mongoose.model("Student", studentSchema);
