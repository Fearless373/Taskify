const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  createActivity,
  getUpcomingActivities,
  getExpiredActivities,
  clearExpiredActivities,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

const router = express.Router();
router.use(requireAuth);

router.get("/", getUpcomingActivities);
router.get("/expired", getExpiredActivities);
router.delete("/expired", clearExpiredActivities);
router.post("/", createActivity);
router.put("/:id", updateActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
