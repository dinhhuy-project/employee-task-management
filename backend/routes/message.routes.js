var express = require("express");
var router = express.Router();
const messageController = require("../controllers/message.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate);
router.use(authorize("owner", "employee"));

// Get all conversations for a user
router.get("/conversations/:userId", messageController.getConversations);

// Get messages in a conversation
router.get(
  "/conversations/:conversationId/messages",
  messageController.getConversationMessages,
);

// Create a new conversation
router.post("/conversations", messageController.createConversation);

// Get unread message count
router.get("/unread/:userId", messageController.getUnreadCount);

// Get available users for conversations
router.get("/available-users/:userId", messageController.getAvailableUsers);

// Mark conversation as read
router.put("/mark-as-read", messageController.markConversationAsRead);

module.exports = router;
