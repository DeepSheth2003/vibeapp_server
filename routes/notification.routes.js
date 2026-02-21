const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");

const {
  getNotifications,
  markAsRead,
  deleteNotification
} = require("../controllers/notification.controller");

router.get("/", protect, getNotifications);
router.patch("/:id", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);

module.exports = router;