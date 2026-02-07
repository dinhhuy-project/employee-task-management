const express = require("express");
const router = express.Router();
const ownerAuthController = require("../controllers/ownerAuth.controller");

// POST /api/owner/auth/send-code
router.post("/send-code", ownerAuthController.sendAccessCode);

// POST /api/owner/auth/validate-code
router.post("/validate-code", ownerAuthController.validateAccessCode);

module.exports = router;
