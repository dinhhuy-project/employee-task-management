const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

/**
 * Generate JWT token for authentication
 */
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

/**
 * Generate unique setup token for account setup
 */
exports.generateSetupToken = () => {
  return uuidv4(); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
};

/**
 * Verify JWT token
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
