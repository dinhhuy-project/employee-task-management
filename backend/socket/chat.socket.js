const Message = require("../collectionTypes/Message");
const Conversation = require("../collectionTypes/Conversation");

const userSockets = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    socket.on("user-join", (userId) => {
      if (!userId) return;

      socket.userId = userId;
      userSockets.set(userId, socket.id);

      socket.join(userId); // personal room

      socket.broadcast.emit("user-online", {
        userId,
        timestamp: new Date(),
      });
    });

    socket.on("send-message", async (payload) => {
      const { conversationId, senderId, senderName, recipientId, content } =
        payload;
      if (!conversationId || !senderId || !recipientId || !content) return;

      const now = new Date();

      try {
        const messageData = {
          conversationId,
          senderId,
          senderName,
          recipientId,
          content,
          timestamp: now,
          isRead: false,
        };

        const messageId = await Message.create(messageData);

        await Conversation.updateLastMessage(conversationId, {
          content,
          senderName,
          timestamp: now,
        });

        const message = { id: messageId, ...messageData };

        // send back to sender
        socket.emit("message-sent", message);

        // send to recipient room
        io.to(recipientId).emit("message-received", message);

        // notify conversation participants
        io.emit("conversation-updated", {
          conversationId,
          lastMessage: content,
          lastMessageTime: now,
          senderName,
        });
      } catch (err) {
        socket.emit("message-error", {
          message: "Failed to send message",
        });
      }
    });

    socket.on("mark-as-read", async ({ messageId }) => {
      if (!messageId) return;

      try {
        const now = new Date();
        await Message.markAsRead(messageId);

        io.emit("message-read", {
          messageId,
          readAt: now,
        });
      } catch (err) {
        console.error("mark-as-read error:", err.message);
      }
    });

    socket.on("load-conversation", async ({ conversationId, limit = 50 }) => {
      if (!conversationId) return;

      try {
        const messages = await Message.getByConversationId(
          conversationId,
          limit,
        );
        socket.emit("conversation-loaded", { conversationId, messages });
      } catch {
        socket.emit("message-error", {
          message: "Could not load conversation",
        });
      }
    });

    socket.on("load-conversations", async ({ userId }) => {
      if (!userId) return;

      try {
        const conversations = await Conversation.getUserConversations(userId);
        socket.emit("conversations-loaded", conversations);
      } catch {
        socket.emit("message-error", {
          message: "Could not load conversations",
        });
      }
    });

    socket.on("user-typing", ({ conversationId, userId, userName }) => {
      if (!conversationId) return;

      socket.broadcast.emit("user-typing", {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on("user-stop-typing", ({ conversationId, userId }) => {
      if (!conversationId) return;

      socket.broadcast.emit("user-stop-typing", {
        conversationId,
        userId,
      });
    });

    socket.on("delete-message", async ({ messageId, conversationId }) => {
      if (!messageId) return;

      try {
        await Message.delete(messageId);

        io.emit("message-deleted", {
          messageId,
          conversationId,
        });
      } catch {
        socket.emit("message-error", {
          message: "Failed to delete message",
        });
      }
    });

    socket.on("disconnect", () => {
      const userId = socket.userId;

      if (userId) {
        userSockets.delete(userId);

        socket.broadcast.emit("user-offline", {
          userId,
          timestamp: new Date(),
        });
      }
    });
  });
};
