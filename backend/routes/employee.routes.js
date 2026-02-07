const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All routes require owner authentication
router.use(authenticate);
router.use(authorize("owner"));

// POST /api/owner/employees/create
router.post("/create", employeeController.createEmployee);

// GET /api/owner/employees
router.get("/", employeeController.getEmployees);

// GET /api/owner/employees/:employeeId
router.get("/:employeeId", employeeController.getEmployee);

// PUT /api/owner/employees/:employeeId
router.put("/:employeeId", employeeController.updateEmployee);

// DELETE /api/owner/employees/:employeeId
router.delete("/:employeeId", employeeController.deleteEmployee);

module.exports = router;
