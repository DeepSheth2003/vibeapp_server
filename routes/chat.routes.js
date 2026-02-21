const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { accessChat, fetchChats, getChatById } = require("../controllers/chat.controller");

router.post("/", protect, accessChat); // Chat start ya access karne ke liye
router.get("/", protect, fetchChats); // Sidebar ki chat list ke liye
router.get('/:chatId', protect, getChatById); // Specific chat ke liye (optional, sidebar ke liye bhi use ho sakta hai)

module.exports = router;