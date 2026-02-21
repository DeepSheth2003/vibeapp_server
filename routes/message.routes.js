const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { sendMessage, allMessages, markAsRead } = require("../controllers/message.controller");

router.post("/", protect, sendMessage);
router.patch("/read/:chatId", protect, markAsRead);
router.get("/:chatId", protect, allMessages);

module.exports = router;