const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  if (!password) {
    throw new Error("Password is required");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;

  return bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
