const express = require("express");
const router = express.Router();
const employeeAuthController = require("../controllers/employeeAuth.controller");
const {
  validateLogin,
  validateAccountSetup,
} = require("../middlewares/validation.middleware");

// GET /api/employee/auth/verify-token?token=xxx
// Verify setup token is valid
router.get("/verify-token", employeeAuthController.verifySetupToken);

// POST /api/employee/auth/setup-account
// Complete account setup with username and password
router.post(
  "/setup-account",
  validateAccountSetup,
  employeeAuthController.setupAccount,
);

// POST /api/employee/auth/login
// Login with username/email and password
router.post("/login", validateLogin, employeeAuthController.login);

// POST /api/employee/auth/send-code
// Send 6-digit code to email for login
router.post("/send-code", employeeAuthController.sendAccessCode);

// POST /api/employee/auth/validate-code
// Validate 6-digit code for login
router.post("/validate-code", employeeAuthController.validateAccessCode);

module.exports = router;
