const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
    },

    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    followRequests: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    fcmToken: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
