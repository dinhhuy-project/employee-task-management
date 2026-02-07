const Task = require("../collectionTypes/Task");

/**
 * Create a new task
 * POST /api/tasks/create
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, status } =
      req.body;
    const ownerId = req.user.userId;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const taskId = await Task.create({
      ownerId,
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "normal",
      status: status || "todo",
    });

    res.json({
      success: true,
      taskId,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get all tasks for the authenticated owner
 * GET /api/tasks
 */
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    let tasks;

    // If owner, get their tasks
    if (req.user.role === "owner") {
      tasks = await Task.findByOwner(userId);
    } else if (req.user.role === "employee") {
      // If employee, get tasks assigned to them
      tasks = await Task.findByEmployee(userId);
    } else {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get a specific task
 * GET /api/tasks/:taskId
 */
exports.getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (
      task.ownerId !== req.user.userId &&
      task.assignedTo !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Get Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update a task
 * PUT /api/tasks/:taskId
 */
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;
    const ownerId = req.user.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization - only owner can update
    if (task.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Task.update(taskId, updateData);

    res.json({
      success: true,
      message: "Task updated successfully",
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:taskId
 */
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const ownerId = req.user.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization - only owner can delete
    if (task.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Task.delete(taskId);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get tasks assigned to a specific employee
 * GET /api/tasks/assigned/:employeeId
 */
exports.getTasksByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const ownerId = req.user.userId;

    // For now, employees can view their own tasks
    // Owners might want to see their employees' tasks (would need additional logic)

    const tasks = await Task.findByEmployee(employeeId);

    // Filter tasks that belong to the requesting owner
    const filteredTasks = tasks.filter((task) => task.ownerId === ownerId);

    res.json({
      success: true,
      tasks: filteredTasks,
    });
  } catch (error) {
    console.error("Get Tasks by Employee Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Assign a task to an employee
 * PUT /api/tasks/:taskId/assign/:employeeId
 */
exports.assignTask = async (req, res) => {
  try {
    const { taskId, employeeId } = req.params;
    const ownerId = req.user.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization
    if (task.ownerId !== ownerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Task.update(taskId, {
      assignedTo: employeeId,
    });

    res.json({
      success: true,
      message: "Task assigned successfully",
    });
  } catch (error) {
    console.error("Assign Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Update task status
 * PUT /api/tasks/:taskId/status
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check authorization - both owner and assigned employee can update status
    if (task.ownerId !== userId && task.assignedTo !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Task.updateStatus(taskId, status);

    res.json({
      success: true,
      message: "Task status updated successfully",
    });
  } catch (error) {
    console.error("Update Task Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
