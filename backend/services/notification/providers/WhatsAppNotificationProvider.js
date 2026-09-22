/**
 * WhatsApp Business API Provider Abstraction
 * Sends WhatsApp template messages if API credentials exist.
 * Returns status: "NOT_CONFIGURED" if credentials are missing — NEVER fakes WhatsApp delivery.
 */
const axios = require("axios");

const sendWhatsApp = async ({ phone, templateName, parameters = [] }) => {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return {
      status: "NOT_CONFIGURED",
      provider: "WhatsApp",
      message: "WhatsApp Business API credentials not configured in environment variables."
    };
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const res = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" }
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return { status: "SENT", provider: "WhatsApp", messageId: res.data.messages?.[0]?.id };
  } catch (err) {
    return { status: "FAILED", provider: "WhatsApp", error: err.response?.data?.error?.message || err.message };
  }
};

module.exports = { sendWhatsApp };
