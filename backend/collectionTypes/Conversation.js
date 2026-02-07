const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

class Conversation {
  static collection() {
    return db.collection("conversations");
  }

  static async create(data) {
    const { user1Id, user2Id } = data;

    const existing = await this.findBetweenUsers(user1Id, user2Id);
    if (existing) return existing.id;

    const now = new Date();

    const ref = await this.collection().add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    return ref.id;
  }

  static async findById(id) {
    const doc = await this.collection().doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() };
  }

  static async findBetweenUsers(userId1, userId2) {
    const snapshot = await this.collection()
      .where("participants", "array-contains", userId1)
      .get();

    const match = snapshot.docs.find((doc) =>
      doc.data().participants?.includes(userId2),
    );

    if (!match) return null;

    return { id: match.id, ...match.data() };
  }

  static async getUserConversations(userId) {
    try {
      const snapshot = await this.collection()
        .where("participants", "array-contains", userId)
        .orderBy("updatedAt", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      // fallback if composite index is missing
      if (
        err.code === 9 ||
        (typeof err.message === "string" &&
          err.message.includes("FAILED_PRECONDITION"))
      ) {
        const snapshot = await this.collection()
          .where("participants", "array-contains", userId)
          .get();

        return snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const aTime = new Date(a.updatedAt || 0).getTime();
            const bTime = new Date(b.updatedAt || 0).getTime();
            return bTime - aTime;
          });
      }

      throw err;
    }
  }

  static async updateLastMessage(conversationId, message) {
    await this.collection().doc(conversationId).update({
      lastMessage: message.content,
      lastMessageSender: message.senderName,
      lastMessageTime: message.timestamp,
      updatedAt: new Date(),
    });
  }

  static async delete(conversationId) {
    return this.collection().doc(conversationId).delete();
  }

  static async addParticipant(conversationId, userId) {
    return this.collection()
      .doc(conversationId)
      .update({
        participants: FieldValue.arrayUnion(userId),
        updatedAt: new Date(),
      });
  }

  static async removeParticipant(conversationId, userId) {
    return this.collection()
      .doc(conversationId)
      .update({
        participants: FieldValue.arrayRemove(userId),
        updatedAt: new Date(),
      });
  }
}

module.exports = Conversation;
