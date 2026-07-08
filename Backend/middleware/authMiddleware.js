const jwt = require("jsonwebtoken");

const SECRET_KEY = "crm_secret_key";

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  let token = authHeader;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    console.log("Decoded:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("JWT ERROR:", err);

    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};