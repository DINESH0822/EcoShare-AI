const express = require("express");
const router = express.Router();

const checkPlaceholder = (val) => {
  if (!val || val.includes("YOUR_")) return "";
  return val;
};

router.get("/", (req, res) => {
  res.json({
    googleMapsApiKey: checkPlaceholder(process.env.GOOGLE_MAPS_API_KEY),
    firebase: {
      apiKey: checkPlaceholder(process.env.FIREBASE_API_KEY),
      authDomain: checkPlaceholder(process.env.FIREBASE_AUTH_DOMAIN),
      projectId: checkPlaceholder(process.env.FIREBASE_PROJECT_ID),
      storageBucket: checkPlaceholder(process.env.FIREBASE_STORAGE_BUCKET),
      messagingSenderId: checkPlaceholder(process.env.FIREBASE_MESSAGING_SENDER_ID),
      appId: checkPlaceholder(process.env.FIREBASE_APP_ID)
    }
  });
});

module.exports = router;
