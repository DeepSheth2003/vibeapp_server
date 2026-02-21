const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ If no token
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Get user (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = protect;