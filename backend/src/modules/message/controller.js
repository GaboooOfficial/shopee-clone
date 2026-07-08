const messageService = require("./service");
const { sendSuccess, sendError } = require("../../utils/response");

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const message = await messageService.sendMessage(
      req.user._id,
      receiverId,
      content,
    );

    // Broadcast message via WebSockets to receiver if online
    const wss = req.app.get("wss");
    if (wss) {
      wss.clients.forEach((client) => {
        if (
          client.userId === receiverId.toString() &&
          client.readyState === 1
        ) {
          // 1 is WebSocket.OPEN
          client.send(
            JSON.stringify({
              type: "new_message",
              data: message,
            }),
          );
        }
      });
    }

    return sendSuccess(res, message, "Message sent successfully", 201);
  } catch (error) {
    return sendError(res, error.message, error.statusCode || 500);
  }
};

const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const messages = await messageService.getConversation(
      req.user._id,
      otherUserId,
    );
    return sendSuccess(res, messages, "Conversation fetched successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getConversationsList = async (req, res) => {
  try {
    const conversations = await messageService.getConversationsList(
      req.user._id,
    );
    return sendSuccess(
      res,
      conversations,
      "Conversations list fetched successfully",
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversationsList,
};
