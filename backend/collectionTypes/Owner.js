const { db } = require("../config/firebase");

class Owner {
  static col() {
    return db.collection("Owners");
  }

  static async findOneByField(field, value) {
    const snapshot = await this.col().where(field, "==", value).limit(1).get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static findByPhone(phoneNumber) {
    return this.findOneByField("phoneNumber", phoneNumber);
  }

  static async findById(id) {
    const doc = await this.col().doc(id).get();
    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() };
  }

  static async create(data) {
    const now = new Date();

    const ref = await this.col().add({
      ...data,
      createdAt: now,
      lastLogin: now,
    });

    return ref.id;
  }

  static updateAccessCode(id, code, expiry) {
    return this.col().doc(id).update({
      accessCode: code,
      accessCodeExpiry: expiry,
    });
  }

  static clearAccessCode(id) {
    return this.col().doc(id).update({
      accessCode: null,
      accessCodeExpiry: null,
    });
  }
}

module.exports = Owner;
