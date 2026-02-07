const Employee = require("../collectionTypes/Employee");
const { generateToken } = require("../utils/tokenGenerator");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { generateCode } = require("../utils/codeGenerator");
const { sendEmail } = require("../utils/sendEmail");

/**
 * Verify if setup token is valid and not expired
 * GET /api/employee/auth/verify-token?token=xxx
 */
exports.verifySetupToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Setup token is required",
      });
    }

    // Find employee by setup token
    const employee = await Employee.findBySetupToken(token);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Invalid setup token",
      });
    }

    // Check if token has expired
    if (
      employee.setupTokenExpiry &&
      new Date() > employee.setupTokenExpiry.toDate()
    ) {
      return res.status(400).json({
        success: false,
        message: "Setup token has expired. Please contact your manager.",
      });
    }

    // Check if account is already setup
    if (employee.accountSetup) {
      return res.status(400).json({
        success: false,
        message: "Account is already setup. Please login instead.",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      employee: {
        name: employee.name,
        email: employee.email,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error("Verify Token Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Setup account with username, password and profile
 * POST /api/employee/auth/setup-account
 */
exports.setupAccount = async (req, res) => {
  try {
    const { setupToken, username, password, phoneNumber, workSchedule } =
      req.body;

    // Validate required fields
    if (!setupToken || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Setup token, username, and password are required",
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Find employee by setup token
    const employee = await Employee.findBySetupToken(setupToken);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Invalid setup token",
      });
    }

    // Check if token has expired
    if (
      employee.setupTokenExpiry &&
      new Date() > employee.setupTokenExpiry.toDate()
    ) {
      return res.status(400).json({
        success: false,
        message: "Setup token has expired. Please contact your manager.",
      });
    }

    // Check if account is already setup
    if (employee.accountSetup) {
      return res.status(400).json({
        success: false,
        message: "Account is already setup. Please login instead.",
      });
    }

    // Check if username already exists
    const existingUser = await Employee.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists. Please choose another one.",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update employee with username, password, and optional profile fields
    const updateData = {
      username,
      passwordHash,
      accountSetup: true,
      setupToken: null,
      setupTokenExpiry: null,
    };

    // Update optional profile fields
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;
    }

    await Employee.update(employee.id, updateData);

    // Generate JWT token for the employee
    const token = generateToken({
      userId: employee.id,
      role: "employee",
      email: employee.email,
      username: username,
    });

    // Send confirmation email
    await sendEmail({
      to: employee.email,
      subject: "Account Setup Successful",
      text: `Hello ${employee.name},\n\nYour account has been successfully set up!\n\nYou can now login to the system with your username and password.\n\nBest regards,\nTask Management Team`,
    });

    res.json({
      success: true,
      message: "Account setup completed successfully",
      employeeId: employee.id,
      email: employee.email,
      name: employee.name,
      token,
      accessToken: token,
    });
  } catch (error) {
    console.error("Setup Account Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Login with username/email and password
 * POST /api/employee/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find employee by username or email
    let employee = await Employee.findByUsername(usernameOrEmail);

    if (!employee) {
      employee = await Employee.findByEmail(usernameOrEmail);
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is setup
    if (!employee.accountSetup) {
      return res.status(400).json({
        success: false,
        message:
          "Account is not setup yet. Please check your email for setup instructions.",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      employee.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: employee.id,
      role: "employee",
      email: employee.email,
      username: employee.username,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        username: employee.username,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Send 6-digit access code to email (Alternative login method)
 * POST /api/employee/auth/send-code
 */
exports.sendAccessCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find employee by email
    const employee = await Employee.findByEmail(email);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Check if account is setup
    if (!employee.accountSetup) {
      return res.status(400).json({
        success: false,
        message:
          "Account is not setup yet. Please check your email for setup instructions.",
      });
    }

    // Generate 6-digit code
    const accessCode = generateCode();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save code to employee record
    await Employee.updateAccessCode(employee.id, accessCode, expiry);

    // Send email with code
    await sendEmail({
      to: employee.email,
      subject: "Your Login Code",
      text: `Hello ${employee.name},\n\nYour login access code is: ${accessCode}\n\nThis code will expire in 5 minutes.\n\nBest regards,\nTask Management Team`,
    });

    res.json({
      success: true,
      message: "Access code sent to your email",
      expiresIn: 300, // seconds
    });
  } catch (error) {
    console.error("Send Code Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Validate 6-digit access code for login
 * POST /api/employee/auth/validate-code
 */
exports.validateAccessCode = async (req, res) => {
  try {
    const { email, accessCode } = req.body;

    if (!email || !accessCode) {
      return res.status(400).json({
        success: false,
        message: "Email and access code are required",
      });
    }

    console.log("EmployeeAuth: Validating access code for email:", email);

    // Find employee by email
    const employee = await Employee.findByEmail(email);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    console.log("EmployeeAuth: Found employee:", employee.id, employee.name);

    // Check if code matches
    if (employee.accessCode !== accessCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid access code",
      });
    }

    // Check if code has expired
    if (
      !employee.accessCodeExpiry ||
      new Date() > employee.accessCodeExpiry.toDate()
    ) {
      return res.status(400).json({
        success: false,
        message: "Access code has expired. Please request a new one.",
      });
    }

    // Clear access code
    await Employee.clearAccessCode(employee.id);

    // Generate JWT token
    const token = generateToken({
      userId: employee.id,
      role: "employee",
      email: employee.email,
      username: employee.username,
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        username: employee.username,
        role: employee.role,
        department: employee.department,
      },
    });
  } catch (error) {
    console.error("Validate Code Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
