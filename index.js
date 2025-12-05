const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (request, response) => {
  response.send("Welcome To Our Backend.");
});

app.listen(PORT, function () {
  console.log(`SERVER RUNNINT @PORT: ${PORT}`);
});
