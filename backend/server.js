const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const foodRoutes = require("./routes/foodRoutes");
const ngoRoutes = require("./routes/ngoRoutes");
const claimRoutes = require("./routes/claimRoutes");
const historyRoutes = require("./routes/historyRoutes");
const configRoutes = require("./routes/configRoutes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/config", configRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("EcoShare AI API Running");
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});