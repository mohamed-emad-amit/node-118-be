// imports
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// internal imports
const authRoutes = require("./routes/authRoutes");
const { connectToDatabase } = require("./config/dbConfig");
const { default: rateLimit } = require("express-rate-limit");

// Global Config
dotenv.config();

// App
const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(express.json());
app.use(
  cors({
    origin: JSON.parse(process.env.PRODUCTION_ENV)
      ? process.env.CLIENT_ORIGIN
      : "*",
  })
);

// Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 });
app.use(limiter);

// Main Routes
app.get("/", (request, response) => {
  response.send("Welcome To Our Backend.");
});

// API Routes
app.use("/api/v1/auth", authRoutes);

// Connect Cloud
connectToDatabase();

// Run Server
app.listen(PORT, function () {
  console.log(`SERVER RUNNINT @PORT: ${PORT}`);
});
