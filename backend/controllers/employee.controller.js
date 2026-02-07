const Employee = require("../collectionTypes/Employee");
const { generateSetupToken } = require("../utils/tokenGenerator");
const { sendSetupEmail } = require("../utils/sendEmail");

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phoneNumber, department, role } = req.body;
    const ownerId = req.user.userId;

    // Check if email already exists
    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // Generate setup token
    const setupToken = generateSetupToken();
    const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const employeeId = await Employee.create({
      ownerId,
      name,
      email,
      phoneNumber,
      department,
      role,
      setupToken,
      setupTokenExpiry: tokenExpiry,
    });

    // Send setup email with HTML template
    await sendSetupEmail({ email, name, token: setupToken });

    res.json({
      success: true,
      employeeId,
      message: "Employee created and invitation email sent",
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const employees = await Employee.findByOwner(ownerId);

    res.json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    await Employee.update(employeeId, updateData);

    res.json({
      success: true,
      message: "Employee updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    await Employee.delete(employeeId);

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
