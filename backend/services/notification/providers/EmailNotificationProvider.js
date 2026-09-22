/**
 * Email Notification Provider Abstraction
 * Sends HTML template emails if SMTP environment credentials exist.
 * Returns status: "NOT_CONFIGURED" if credentials are missing — NEVER fakes email delivery.
 */

const sendEmail = async ({ to, subject, htmlBody }) => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!host || !user || !pass) {
    return {
      status: "NOT_CONFIGURED",
      provider: "Email",
      message: "SMTP email credentials not configured in environment variables."
    };
  }

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: { user, pass }
    });

    const info = await transporter.sendMail({
      from: `"EcoShare AI Platform" <${user}>`,
      to,
      subject,
      html: htmlBody
    });

    return { status: "SENT", provider: "Email", messageId: info.messageId };
  } catch (err) {
    return { status: "FAILED", provider: "Email", error: err.message };
  }
};

module.exports = { sendEmail };
