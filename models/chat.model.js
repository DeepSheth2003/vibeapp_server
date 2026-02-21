const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // Do users ki ID yahan rahegi
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Chat list mein last message dikhane ke liye
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);