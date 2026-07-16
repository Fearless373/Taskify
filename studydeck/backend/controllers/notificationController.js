const Notification = require("../models/Notification");

// GET /api/notifications
async function getNotifications(req, res) {
  const notifications = await Notification.find({ student: req.studentId }).sort({ triggerAt: -1 });
  return res.json({ notifications });
}

// POST /api/notifications  (custom, student-created)
async function createNotification(req, res) {
  try {
    const { title, message, triggerAt } = req.body;
    if (!title || !triggerAt) {
      return res.status(400).json({ message: "title and triggerAt are required" });
    }

    const notification = await Notification.create({
      student: req.studentId,
      title,
      message,
      triggerAt: new Date(triggerAt),
      source: "custom",
    });

    return res.status(201).json({ notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not create notification" });
  }
}

// PUT /api/notifications/:id  (only custom notifications may be edited)
async function updateNotification(req, res) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      student: req.studentId,
      source: "custom",
    });
    if (!notification) {
      return res.status(404).json({ message: "Custom notification not found" });
    }

    const { title, message, triggerAt, isRead } = req.body;
    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (triggerAt !== undefined) notification.triggerAt = new Date(triggerAt);
    if (isRead !== undefined) notification.isRead = isRead;

    await notification.save();
    return res.json({ notification });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update notification" });
  }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res) {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    student: req.studentId,
  });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  return res.json({ message: "Notification deleted" });
}

module.exports = { getNotifications, createNotification, updateNotification, deleteNotification };
