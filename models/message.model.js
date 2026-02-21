const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Kis chat ka message hai
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    // Kisne bheja
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Kya message bheja
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // Blue tick logic ke liye
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);