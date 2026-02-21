const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 🔹 Username Availability Check
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });

    if (existingUser) {
      // Suggest alternatives
      const suggestions = [
        `${username}_01`,
        `${username}${Math.floor(Math.random() * 1000)}`,
        `${username}_vibe`,
      ];

      return res.json({
        available: false,
        suggestions,
      });
    }

    res.json({ available: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔹 Register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const usernameExists = await User.findOne({
      username: username.toLowerCase(),
    });

    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const emailExists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};


// 🔹 Login
exports.loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

