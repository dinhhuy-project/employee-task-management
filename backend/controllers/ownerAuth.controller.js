const Owner = require("../collectionTypes/Owner");
const { generateCode } = require("../utils/codeGenerator");
const { generateToken } = require("../utils/tokenGenerator");
const { sendSMS } = require("../utils/sendSMS");

exports.sendAccessCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Generate 6-digit code
    const accessCode = generateCode();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find or create user
    let user = await Owner.findByPhone(phoneNumber);
    if (!user) {
      const userId = await Owner.create({
        phoneNumber,
        role: "owner",
        accessCode,
        accessCodeExpiry: expiry,
      });
      user = { id: userId };
    } else {
      await Owner.updateAccessCode(user.id, accessCode, expiry);
    }

    // Send SMS
    await sendSMS(phoneNumber, `Your access code is: ${accessCode}`);

    res.json({
      success: true,
      message: "Access code sent to your phone",
      expiresIn: 300,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.validateAccessCode = async (req, res) => {
  try {
    const { phoneNumber, accessCode } = req.body;

    const user = await Owner.findByPhone(phoneNumber);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Owner not found" });
    }

    // Check code and expiry
    if (user.accessCode !== accessCode) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid access code" });
    }

    if (new Date() > user.accessCodeExpiry.toDate()) {
      return res
        .status(400)
        .json({ success: false, message: "Access code expired" });
    }

    // Clear access code
    await Owner.clearAccessCode(user.id);

    // Generate JWT
    const token = generateToken({ userId: user.id, role: "owner" });

    res.json({
      success: true,
      token,
      user: {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
