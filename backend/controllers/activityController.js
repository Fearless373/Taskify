const { Activity, ACTIVITY_TYPES } = require("../models/Activity");

// POST /api/activities
async function createActivity(req, res) {
  try {
    const { title, description, course, type, startTime, endTime } = req.body;

    if (!title || !course || !type || !startTime) {
      return res.status(400).json({ message: "title, course, type, and startTime are required" });
    }
    if (!ACTIVITY_TYPES.includes(type)) {
      return res.status(400).json({ message: `type must be one of: ${ACTIVITY_TYPES.join(", ")}` });
    }

    const activity = await Activity.create({
      student: req.studentId,
      title,
      description,
      course,
      type,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
    });

    return res.status(201).json({ activity });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create activity" });
  }
}

// GET /api/activities  (upcoming, not expired)
async function getUpcomingActivities(req, res) {
  const now = new Date();
  const activities = await Activity.find({
    student: req.studentId,
    $or: [{ endTime: { $gte: now } }, { endTime: null, startTime: { $gte: now } }],
  }).sort({ startTime: 1 });

  return res.json({ activities });
}

// GET /api/activities/expired
async function getExpiredActivities(req, res) {
  const now = new Date();
  const activities = await Activity.find({
    student: req.studentId,
    type: { $in: ["assignment", "project", "midsem"] },
    $or: [{ endTime: { $lt: now } }, { endTime: null, startTime: { $lt: now } }],
  }).sort({ startTime: -1 });

  return res.json({ activities });
}

// PUT /api/activities/:id
async function updateActivity(req, res) {
  try {
    const activity = await Activity.findOne({ _id: req.params.id, student: req.studentId });
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const { title, description, course, type, startTime, endTime } = req.body;
    if (title !== undefined) activity.title = title;
    if (description !== undefined) activity.description = description;
    if (course !== undefined) activity.course = course;
    if (type !== undefined) {
      if (!ACTIVITY_TYPES.includes(type)) {
        return res.status(400).json({ message: `type must be one of: ${ACTIVITY_TYPES.join(", ")}` });
      }
      activity.type = type;
    }
    if (startTime !== undefined) {
      activity.startTime = new Date(startTime);
      // Reset notification flags if the start time changes so reminders re-fire correctly
      activity.dayStartNotified = false;
      activity.oneHourNotified = false;
    }
    if (endTime !== undefined) activity.endTime = endTime ? new Date(endTime) : undefined;

    await activity.save();
    return res.json({ activity });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update activity" });
  }
}

// DELETE /api/activities/:id
async function deleteActivity(req, res) {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, student: req.studentId });
  if (!activity) return res.status(404).json({ message: "Activity not found" });
  return res.json({ message: "Activity deleted" });
}

module.exports = {
  createActivity,
  getUpcomingActivities,
  getExpiredActivities,
  updateActivity,
  deleteActivity,
};
