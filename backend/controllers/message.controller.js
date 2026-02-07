const Message = require("../collectionTypes/Message");
const Conversation = require("../collectionTypes/Conversation");
const Employee = require("../collectionTypes/Employee");
const Owner = require("../collectionTypes/Owner");

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Message Controller: getConversations for userId:", userId);

    const conversations = await Conversation.getUserConversations(userId);
    console.log(
      "Message Controller: Found conversations:",
      conversations?.length || 0,
    );

    res.json({
      status: "success",
      conversations: conversations || [],
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get conversations",
      error: error.message,
    });
  }
};

exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.getByConversationId(
      conversationId,
      parseInt(limit),
    );

    res.json({
      status: "success",
      messages: messages || [],
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get messages",
      error: error.message,
    });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const { user1Id, user1Name, user2Id, user2Name } = req.body;

    const conversationId = await Conversation.create({
      participants: [user1Id, user2Id],
      user1Id,
      user1Name,
      user2Id,
      user2Name,
      lastMessage: "",
      lastMessageSender: "",
      lastMessageTime: new Date(),
    });

    res.json({
      status: "success",
      conversationId,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create conversation",
      error: error.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Message.getUnreadCount(userId);

    res.json({
      status: "success",
      unreadCount: count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get unread count",
      error: error.message,
    });
  }
};

exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId, userId } = req.body;

    await Message.markConversationAsRead(conversationId, userId);

    res.json({
      status: "success",
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to mark conversation as read",
      error: error.message,
    });
  }
};

exports.getAvailableUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRole = req.user.role; // From auth middleware

    console.log(
      "Message Controller: getAvailableUsers - userId:",
      userId,
      "role:",
      userRole,
    );

    let users = [];

    if (userRole === "owner") {
      // Owners can message their employees
      const ownerId = userId;
      const employees = await Employee.findByOwner(ownerId);
      console.log(
        "Message Controller: Found employees:",
        employees?.length || 0,
      );
      users = employees.map((emp) => ({
        id: emp.id,
        name: emp.name || emp.email,
        email: emp.email,
      }));
    } else if (userRole === "employee") {
      // Employees can message the owner who created them
      const employee = await Employee.findById(userId);
      console.log(
        "Message Controller: Found employee:",
        employee?.id,
        "ownerId:",
        employee?.ownerId,
      );
      if (employee && employee.ownerId) {
        const owner = await Owner.findById(employee.ownerId);
        console.log("Message Controller: Found owner:", owner?.id, owner?.name);
        if (owner) {
          users = [
            {
              id: owner.id,
              name: owner.name || owner.phoneNumber || "Owner",
              email: owner.phoneNumber || "N/A",
            },
          ];
        }
      }
    }

    console.log("Message Controller: Returning users:", users.length);
    res.json({
      status: "success",
      users,
    });
  } catch (error) {
    console.error("Error getting available users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get available users",
      error: error.message,
    });
  }
};
