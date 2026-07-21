const express = require("express");
const requireAuth = require("../middleware/auth");
const { requestProfileUpdate, confirmProfileUpdate } = require("../controllers/profileController");

const router = express.Router();

router.post("/update", requireAuth, requestProfileUpdate);
router.post("/confirm", confirmProfileUpdate); // public - token is the credential

module.exports = router;
