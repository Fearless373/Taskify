const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();
router.use(requireAuth);

router.get("/", getNotifications);
router.post("/", createNotification);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

module.exports = router;
