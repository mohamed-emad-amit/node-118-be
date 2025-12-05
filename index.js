// imports
const express = require("express");
const dotenv = require("dotenv");
const { connectToDatabase } = require("./config/dbConfig");

// Global Config
dotenv.config();

// App
const app = express();

const PORT = process.env.PORT || 3000;

// Main Routes
app.get("/", (request, response) => {
  response.send("Welcome To Our Backend.");
});

// Connect Cloud
connectToDatabase();

// Run Server
app.listen(PORT, function () {
  console.log(`SERVER RUNNINT @PORT: ${PORT}`);
});
