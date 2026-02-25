const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");

const {
  searchUsers,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  saveFcmToken,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
} = require("../controllers/user.controller");

router.get("/search", protect, searchUsers);
router.post("/save-fcm-token", protect, saveFcmToken);
router.post("/follow/:id", protect, sendFollowRequest);
router.post("/accept/:id", protect, acceptFollowRequest);
router.post("/reject/:id", protect, rejectFollowRequest);
router.get("/profile", protect, getProfile);
router.put("/profile/update", protect, updateProfile);
router.put("/profile/password", protect, changePassword);
router.put("/logout", protect, logoutUser);

module.exports = router;
