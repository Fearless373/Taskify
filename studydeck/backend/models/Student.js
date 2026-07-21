const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    profilePicture: { type: String, default: "" },

    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

    pendingUpdate: { type: mongoose.Schema.Types.Mixed, default: null },
    updateToken: { type: String },
    updateTokenExpires: { type: Date },
  },
  { timestamps: true }
);

studentSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.resetPasswordToken;
  delete obj.updateToken;
  return obj;
};

module.exports = mongoose.model("Student", studentSchema);
