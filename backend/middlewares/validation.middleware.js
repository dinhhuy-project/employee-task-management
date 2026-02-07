exports.validateAccountSetup = (req, res, next) => {
  const { setupToken, username, password, phoneNumber } = req.body;

  const errors = [];

  if (!setupToken || setupToken.trim() === "") {
    errors.push("Setup token is required");
  }

  if (!username || username.trim() === "") {
    errors.push("Username is required");
  } else if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, and underscores");
  }

  if (!password || password.trim() === "") {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!phoneNumber || phoneNumber.trim() === "") {
    errors.push("Phone number is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { usernameOrEmail, password } = req.body;

  const errors = [];

  if (!usernameOrEmail || usernameOrEmail.trim() === "") {
    errors.push("Username or email is required");
  }

  if (!password || password.trim() === "") {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
