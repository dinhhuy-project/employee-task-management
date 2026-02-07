const transporter = require("../config/nodemailer");

function buildSetupEmail({ name, setupLink }) {
  const text = `
Hi ${name},

You’ve been added to the system.

Set up your account here:
${setupLink}

This link expires in 7 days.
  `.trim();

  const html = `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
  <h2>Welcome 👋</h2>
  <p>Hi ${name},</p>
  <p>You’ve been added to the system.</p>
  <p>
    <a href="${setupLink}" 
       style="display:inline-block;padding:12px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:4px;">
      Set up account
    </a>
  </p>
  <p style="font-size:12px;color:#666;">
    If the button doesn’t work, copy this link:<br/>
    ${setupLink}
  </p>
</div>
  `.trim();

  return { text, html };
}

async function sendEmail(options) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    ...options,
  });
}

async function sendSetupEmail({ email, name, token }) {
  const setupLink = `${process.env.FRONTEND_URL}/setup?token=${token}`;

  const { html, text } = buildSetupEmail({ name, setupLink });

  return sendEmail({
    to: email,
    subject: "Set up your account",
    text,
    html,
  });
}

module.exports = {
  sendEmail,
  sendSetupEmail,
};
