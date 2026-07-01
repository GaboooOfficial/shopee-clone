const Message = require('./model');
const User = require('../auth/model');
const Store = require('../store/model');

const sendMessage = async (senderId, receiverId, content) => {
  if (!content || !content.trim()) {
    const error = new Error('Message content cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  // Verify receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    const error = new Error('Receiver not found');
    error.statusCode = 404;
    throw error;
  }

  const message = await Message.create({
    senderId,
    receiverId,
    content
  });

  // Populate sender details before returning
  return await Message.findById(message._id)
    .populate('senderId', 'profile email role')
    .populate('receiverId', 'profile email role');
};

const getConversation = async (userId, otherUserId) => {
  // Mark messages sent by otherUserId to userId as read
  await Message.updateMany(
    { senderId: otherUserId, receiverId: userId, isRead: false },
    { $set: { isRead: true } }
  );

  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  })
  .sort({ createdAt: 1 })
  .populate('senderId', 'profile email role')
  .populate('receiverId', 'profile email role');

  return messages;
};

const getConversationsList = async (userId) => {
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }]
  })
  .sort({ createdAt: -1 })
  .populate('senderId', 'profile email role')
  .populate('receiverId', 'profile email role');

  const conversationsMap = {};
  for (const msg of messages) {
    if (!msg.senderId || !msg.receiverId) continue;
    const otherUser = msg.senderId._id.toString() === userId.toString() ? msg.receiverId : msg.senderId;
    if (!otherUser) continue;
    const otherUserId = otherUser._id.toString();
    if (!conversationsMap[otherUserId]) {
      // Find store info if other user is a store owner
      let storeInfo = null;
      if (otherUser.role === 'store_owner') {
        storeInfo = await Store.findOne({ ownerId: otherUser._id });
      }

      conversationsMap[otherUserId] = {
        otherUser: {
          _id: otherUser._id,
          email: otherUser.email,
          role: otherUser.role,
          profile: otherUser.profile,
          storeInfo
        },
        lastMessage: {
          _id: msg._id,
          content: msg.content,
          senderId: msg.senderId._id,
          receiverId: msg.receiverId._id,
          isRead: msg.isRead,
          createdAt: msg.createdAt
        }
      };
    }
  }

  // Return sorted by the last message's creation date (newest first)
  return Object.values(conversationsMap).sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList
};
