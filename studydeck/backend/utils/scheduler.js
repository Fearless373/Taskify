const cron = require("node-cron");
const { Activity } = require("../models/Activity");
const Notification = require("../models/Notification");
const Student = require("../models/Student");
const sendEmail = require("./sendEmail");

// Runs every minute, checking which activities need a notification created/sent.
function startScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      await handleDayStartNotifications();
      await handleOneHourNotifications();
      await handleCustomNotifications();
    } catch (err) {
      console.error("Scheduler error:", err.message);
    }
  });
  console.log("Notification scheduler started (runs every minute)");
}

async function handleDayStartNotifications() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const activities = await Activity.find({
    startTime: { $gte: startOfToday, $lt: startOfTomorrow },
    dayStartNotified: false,
  });

  for (const activity of activities) {
    await createAndSendNotification(activity, "Today is the day", dayStartMessage(activity));
    activity.dayStartNotified = true;
    await activity.save();
  }
}

async function handleOneHourNotifications() {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  const windowStart = new Date(now.getTime() + 59 * 60 * 1000);

  const activities = await Activity.find({
    startTime: { $gte: windowStart, $lte: inOneHour },
    oneHourNotified: false,
  });

  for (const activity of activities) {
    await createAndSendNotification(activity, "Starting in 1 hour", oneHourMessage(activity));
    activity.oneHourNotified = true;
    await activity.save();
  }
}

async function handleCustomNotifications() {
  const now = new Date();

  const dueNotifications = await Notification.find({
    source: "custom",
    isSent: false,
    triggerAt: { $lte: now },
  });

  for (const notification of dueNotifications) {
    try {
      const student = await Student.findById(notification.student);
      if (student) {
        await sendEmail({
          to: student.email,
          subject: `StudyDeck reminder: ${notification.title}`,
          html: `<p>Hi ${student.fullName},</p><p>${notification.message || notification.title}</p>`,
        });
      }
    } catch (err) {
      console.error("Failed to send custom notification email:", err.message);
    }

    notification.isSent = true;
    await notification.save();
  }
}

function dayStartMessage(activity) {
  return `${labelFor(activity.type)} "${activity.title}" (${activity.course}) starts today at ${formatTime(activity.startTime)}.`;
}

function oneHourMessage(activity) {
  return `${labelFor(activity.type)} "${activity.title}" (${activity.course}) starts in about 1 hour, at ${formatTime(activity.startTime)}.`;
}

function labelFor(type) {
  const map = {
    assignment: "Assignment",
    project: "Project work",
    midsem: "Midsem exam",
    semester_exam: "End of semester exam",
    lecture: "Lecture",
  };
  return map[type] || "Activity";
}

function formatTime(date) {
  return new Date(date).toLocaleString();
}

async function createAndSendNotification(activity, title, message) {
  const notification = await Notification.create({
    student: activity.student,
    activity: activity._id,
    title,
    message,
    triggerAt: new Date(),
    source: "auto",
    isSent: true,
  });

  try {
    const student = await Student.findById(activity.student);
    if (student) {
      await sendEmail({
        to: student.email,
        subject: `StudyDeck: ${title} - ${activity.title}`,
        html: `<p>Hi ${student.fullName},</p><p>${message}</p>`,
      });
    }
  } catch (err) {
    console.error("Failed to send notification email:", err.message);
  }

  return notification;
}

module.exports = startScheduler;
