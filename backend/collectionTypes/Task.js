const { db } = require("../config/firebase");

class Task {
  static col() {
    return db.collection("tasks");
  }

  static async create(data) {
    const now = new Date();
    const ref = this.col().doc();

    await ref.set({
      id: ref.id,
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

  static async findManyByField(field, value) {
    const snapshot = await this.col().where(field, "==", value).get();

    return this.sortByCreatedAt(
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    );
  }

  static findByOwner(ownerId) {
    return this.findManyByField("ownerId", ownerId);
  }

  static findByEmployee(employeeId) {
    return this.findManyByField("assignedTo", employeeId);
  }

  static sortByCreatedAt(tasks) {
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  static async update(id, updates) {
    return this.col()
      .doc(id)
      .update({
        ...updates,
        updatedAt: new Date(),
      });
  }

  static delete(id) {
    return this.col().doc(id).delete();
  }

  static updateStatus(id, status) {
    return this.update(id, { status });
  }
}

module.exports = Task;
