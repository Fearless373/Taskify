const mongoose = require("mongoose");

const ACTIVITY_TYPES = ["assignment", "project", "midsem", "lecture"];

const activitySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    course: { type: String, required: true, trim: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },

    // startTime is what deadlines/lecture start notifications are based on
    startTime: { type: Date, required: true },
    endTime: { type: Date },

    // internal flags so the scheduler doesn't send duplicate notifications
    dayStartNotified: { type: Boolean, default: false },
    oneHourNotified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

activitySchema.virtual("isExpired").get(function () {
  const reference = this.endTime || this.startTime;
  return reference < new Date();
});

activitySchema.set("toJSON", { virtuals: true });
activitySchema.set("toObject", { virtuals: true });

const Activity = mongoose.model("Activity", activitySchema);
module.exports = { Activity, ACTIVITY_TYPES };
