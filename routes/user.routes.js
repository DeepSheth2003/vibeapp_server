const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");

const {
  searchUsers,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  saveFcmToken,
} = require("../controllers/user.controller");

router.get("/search", protect, searchUsers);
router.post("/save-fcm-token", protect, saveFcmToken);
router.post("/follow/:id", protect, sendFollowRequest);
router.post("/accept/:id", protect, acceptFollowRequest);
router.post("/reject/:id", protect, rejectFollowRequest);

module.exports = router;