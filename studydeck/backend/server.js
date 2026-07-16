require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const startScheduler = require("./utils/scheduler");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`StudyDeck API running on port ${PORT}`);
    startScheduler();
  });
});
