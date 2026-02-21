const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  checkUsername,
} = require("../controllers/auth.controller");

router.get("/check-username", checkUsername);
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
