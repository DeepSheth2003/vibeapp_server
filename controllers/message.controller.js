const Message = require("../models/message.model");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");

// 📩 Message Bhejna
exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data passed into request" });
  }

  try {
    let message = await Message.create({
      sender: req.user.id,
      text: content,
      chatId: chatId,
    });

    message = await message.populate("sender", "username name");
    message = await message.populate("chatId");
    message = await User.populate(message, {
      path: "chatId.participants",
      select: "username name",
    });

    // Chat model mein latest message update karo
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📜 Saare Messages Fetch Karna (Infinite Scroll Logic)
exports.allMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Ek baar mein 20 messages
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId })
      .populate("sender", "username name")
      .sort({ createdAt: -1 }) // Naye messages pehle
      .skip(skip)
      .limit(limit);

    // Frontend ko reverse karke bhejenge taaki order sahi dikhe
    res.json(messages.reverse()); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.updateMany(
      { chatId, sender: { $ne: req.user.id }, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};