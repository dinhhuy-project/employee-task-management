const { db } = require("../config/firebase");

class Message {
  static col() {
    return db.collection("messages");
  }

  static async create(data) {
    const now = new Date();

    const ref = await this.col().add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

    return ref.id;
  }

  static async findById(id) {
    const doc = await this.col().doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() };
  }

  static async getByConversationId(conversationId, limit = 50) {
    try {
      const snapshot = await this.col()
        .where("conversationId", "==", conversationId)
        .orderBy("timestamp", "desc")
        .limit(limit)
        .get();

      // reverse because we fetch newest first
      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .reverse();
    } catch (err) {
      if (
        err.code !== 9 &&
        !(
          typeof err.message === "string" &&
          err.message.includes("FAILED_PRECONDITION")
        )
      ) {
        throw err;
      }

      const snapshot = await this.col()
        .where("conversationId", "==", conversationId)
        .limit(limit)
        .get();

      return snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => {
          const aTime = new Date(a.timestamp || 0).getTime();
          const bTime = new Date(b.timestamp || 0).getTime();
          return aTime - bTime;
        });
    }
  }

  static async markAsRead(id) {
    return this.col().doc(id).update({
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static delete(id) {
    return this.col().doc(id).delete();
  }

  static async getUnreadCount(userId) {
    try {
      const snapshot = await this.col()
        .where("recipientId", "==", userId)
        .where("isRead", "==", false)
        .get();

      return snapshot.size;
    } catch (err) {
      if (
        err.code === 9 ||
        (typeof err.message === "string" &&
          err.message.includes("FAILED_PRECONDITION"))
      ) {
        return 0;
      }

      throw err;
    }
  }

  static async markConversationAsRead(conversationId, userId) {
    const snapshot = await this.col()
      .where("conversationId", "==", conversationId)
      .where("recipientId", "==", userId)
      .where("isRead", "==", false)
      .get();

    if (snapshot.empty) return;

    const batch = db.batch();
    const now = new Date();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        isRead: true,
        readAt: now,
        updatedAt: now,
      });
    });

    await batch.commit();
  }
}

module.exports = Message;
