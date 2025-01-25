const jwt = require("jsonwebtoken");
const JWT_SECRET = "asdrty7654#!";

function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, token required" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token from 'Bearer <token>'
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded) {
      req.userId = decoded.id; // Use 'id' from token payload, not 'token.userId'
      next();
    } else {
      res.status(403).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  auth,
  JWT_SECRET,
};
