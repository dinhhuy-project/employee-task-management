const jwt = require("jsonwebtoken");

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

function authenticate(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({ message: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
