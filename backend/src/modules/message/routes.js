const express = require("express");
const router = express.Router();
const messageController = require("./controller");
const { protect } = require("../../middleware/auth");

router.post("/", protect, messageController.sendMessage);
router.get("/conversations", protect, messageController.getConversationsList);
router.get(
  "/conversation/:otherUserId",
  protect,
  messageController.getConversation,
);

module.exports = router;
