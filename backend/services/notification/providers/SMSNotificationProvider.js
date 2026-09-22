/**
 * SMS Provider Abstraction (Twilio / SMS Gateway)
 * Returns status: "NOT_CONFIGURED" if credentials missing.
 */
const sendSMS = async ({ phone, text }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return {
      status: "NOT_CONFIGURED",
      provider: "SMS",
      message: "SMS gateway credentials not configured in environment variables."
    };
  }

  try {
    const twilio = require("twilio")(accountSid, authToken);
    const message = await twilio.messages.create({
      body: text,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    return { status: "SENT", provider: "SMS", messageId: message.sid };
  } catch (err) {
    return { status: "FAILED", provider: "SMS", error: err.message };
  }
};

module.exports = { sendSMS };
