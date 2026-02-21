const Chat = require("../models/chat.model");
const User = require("../models/user.model");

exports.accessChat = async (req, res) => {
  const { userId } = req.body; // Samne wale user ki ID

  if (!userId) return res.status(400).json({ message: "UserId not provided" });

  try {
    // 1. Check Friendship (Dono side se following honi chahiye)
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(userId);

    const isFriend = currentUser.following.includes(userId) && 
                     targetUser.following.includes(req.user.id);

    if (!isFriend) {
      return res.status(403).json({ message: "You can only chat with friends!" });
    }

    // 2. Check if Chat already exists
    let isChat = await Chat.find({
      $and: [
        { participants: { $elemMatch: { $eq: req.user.id } } },
        { participants: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("participants", "username name")
      .populate("latestMessage");

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      // 3. Create New Chat
      const chatData = {
        participants: [req.user.id, userId],
      };
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "participants",
        "username name"
      );
      res.status(200).json(fullChat);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("participants", "username name")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🆔 Get Single Chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "username name isOnline lastSeen") // Status ke liye fields populate karein
      .populate("latestMessage");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Security: Check agar user is chat ka part hai
    const isParticipant = chat.participants.some(p => p._id.toString() === req.user.id);
    if (!isParticipant) return res.status(403).json({ message: "Access denied" });

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};