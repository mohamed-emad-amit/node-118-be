// imports
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// global config
dotenv.config();

// Auth Middleware Validate User Logged In
function authMiddleware(request, response, next) {
  try {
    // Validate Headers
    const auth = request.headers["authorization"];

    console.log(request.headers);
    if (!auth) return response.status(401).json({ message: "unauthorized" });

    // Validate Token
    const token = auth.split(" ")[1];
    if (!token) return response.status(401).json({ message: "unauthorized" });

    // Verify Token

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.user = payload;

    next();
  } catch (error) {
    return response.status(401).json({ message: "unauthorized" });
  }
}

module.exports = { authMiddleware };
