// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

import jwt from "jsonwebtoken"; // Change this line
import crypto from "crypto"; // Change this line

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// HAsh Token
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token.toString()).digest("hex");
};

// module.exports = {
//   generateToken,
//   hashToken,
// };

export { generateToken, hashToken }; // Change this line
