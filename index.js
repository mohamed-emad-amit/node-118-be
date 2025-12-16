// imports
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// internal imports
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const postsRoutes = require("./routes/postsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const { connectToDatabase } = require("./config/dbConfig");
const { default: rateLimit } = require("express-rate-limit");

// Global Config
dotenv.config();

// App
const app = express();
const PORT = process.env.PORT || 3000;

// Serve Static Files
app.use("/public", express.static(path.join(__dirname, "public"))); // server -> access default
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // user front end access profilePic

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
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/comments", commentsRoutes);

// Connect Cloud
connectToDatabase();

// Run Server
app.listen(PORT, function () {
  console.log(`SERVER RUNNINT @PORT: ${PORT}`);
});
