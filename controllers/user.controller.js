const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const bcrypt = require("bcryptjs");

// 🔍 Search Users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: req.user.id }, // exclude self
    })
      .select("username followers following followRequests")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
};

exports.sendFollowRequest = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.followRequests.includes(currentUser._id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    if (targetUser.followers.includes(currentUser._id)) {
      return res.status(400).json({ message: "Already following" });
    }

    targetUser.followRequests.push(currentUser._id);
    await targetUser.save();

    await Notification.create({
      recipient: targetUser._id,
      sender: currentUser._id,
      type: "follow_request",
    });

    res.json({ message: "Follow request sent" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send request" });
  }
};

exports.acceptFollowRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requester = await User.findById(req.params.id);

    if (!requester) {
      return res.status(404).json({ message: "User not found" });
    }

    const requestExists = currentUser.followRequests.some(
      (id) => id.toString() === requester._id.toString(),
    );

    if (!requestExists) {
      return res.status(400).json({ message: "No follow request found" });
    }

    // 🔥 Remove request
    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== requester._id.toString(),
    );

    // 🔥 Add follower/following both sides
    if (!currentUser.followers.includes(requester._id)) {
      currentUser.followers.push(requester._id);
    }

    if (!requester.following.includes(currentUser._id)) {
      requester.following.push(currentUser._id);
    }

    await currentUser.save();
    await requester.save();

    // 🔔 Create accept notification
    await Notification.create({
      recipient: requester._id,
      sender: currentUser._id,
      type: "follow_accept",
    });

    res.json({ message: "Follow request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept request" });
  }
};

exports.rejectFollowRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    const requestExists = currentUser.followRequests.some(
      (id) => id.toString() === req.params.id,
    );

    if (!requestExists) {
      return res.status(400).json({ message: "No follow request found" });
    }

    currentUser.followRequests = currentUser.followRequests.filter(
      (id) => id.toString() !== req.params.id,
    );

    await currentUser.save();

    res.json({ message: "Follow request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject request" });
  }
};

exports.saveFcmToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      fcmToken: req.body.token,
    });

    res.json({ message: "FCM token saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save token" });
  }
};

// 👤 Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("followers", "username name")
      .populate("following", "username name");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ✏️ Update Profile (Name/Username)
exports.updateProfile = async (req, res) => {
  try {
    const { name, username } = req.body;
    const user = await User.findById(req.user.id);

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing) return res.status(400).json({ message: "Username taken" });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// 🔒 Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong current password" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Password update failed" });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    // User ko offline mark karein
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastSeen: new Date(),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
