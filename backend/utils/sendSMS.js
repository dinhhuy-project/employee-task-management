const twilioClient = require("../config/twilio");

exports.sendSMS = async (phoneNumber, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  } catch (error) {
    console.error("SMS Error:", error);
    throw error;
  }
};
