const { db } = require("../config/firebase");

class Employee {
  static col() {
    return db.collection("employees");
  }

  static async create(data) {
    const now = new Date();

    const ref = await this.col().add({
      ...data,
      accountSetup: false,
      username: null,
      passwordHash: null,
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

  static async findOneByField(field, value) {
    const snapshot = await this.col().where(field, "==", value).limit(1).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static findByEmail(email) {
    return this.findOneByField("email", email);
  }

  static findByUsername(username) {
    return this.findOneByField("username", username);
  }

  static findBySetupToken(token) {
    return this.findOneByField("setupToken", token);
  }

  static async findByOwner(ownerId) {
    try {
      const snapshot = await this.col().where("ownerId", "==", ownerId).get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      if (
        err.code === 9 ||
        (typeof err.message === "string" &&
          err.message.includes("FAILED_PRECONDITION"))
      ) {
        return [];
      }

      throw err;
    }
  }

  static async update(id, updates) {
    return this.col()
      .doc(id)
      .update({
        ...updates,
        updatedAt: new Date(),
      });
  }

  static async setupAccount(id, username, passwordHash) {
    return this.update(id, {
      username,
      passwordHash,
      accountSetup: true,
      setupToken: null,
      setupTokenExpiry: null,
    });
  }

  static async updateAccessCode(id, code, expiry) {
    return this.update(id, {
      accessCode: code,
      accessCodeExpiry: expiry,
    });
  }

  static async clearAccessCode(id) {
    return this.update(id, {
      accessCode: null,
      accessCodeExpiry: null,
    });
  }

  static delete(id) {
    return this.col().doc(id).delete();
  }
}

module.exports = Employee;
