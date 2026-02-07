const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All task routes require authentication (both owner and employee)
router.use(authenticate);

// POST /api/tasks/create - Create a new task (owner only)
router.post("/create", authorize("owner"), taskController.createTask);

// GET /api/tasks - Get all tasks (owner gets their tasks, employee gets assigned tasks)
router.get("/", taskController.getTasks);

// GET /api/tasks/:taskId - Get a specific task
router.get("/:taskId", taskController.getTask);

// PUT /api/tasks/:taskId - Update a task (owner only)
router.put("/:taskId", authorize("owner"), taskController.updateTask);

// PUT /api/tasks/:taskId/status - Update task status (both owner and employee)
router.put("/:taskId/status", taskController.updateTaskStatus);

// DELETE /api/tasks/:taskId - Delete a task (owner only)
router.delete("/:taskId", authorize("owner"), taskController.deleteTask);

// GET /api/tasks/assigned/:employeeId - Get tasks assigned to an employee
router.get("/assigned/:employeeId", taskController.getTasksByEmployee);

// PUT /api/tasks/:taskId/assign/:employeeId - Assign a task to an employee (owner only)
router.put(
  "/:taskId/assign/:employeeId",
  authorize("owner"),
  taskController.assignTask,
);

module.exports = router;
