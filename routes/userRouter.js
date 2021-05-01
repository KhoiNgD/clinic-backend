const express = require("express");
const authController = require("../controllers/authController");
const {
  validateRequest,
} = require("../middlewares/validates/validate-request");
const {
  validateSignup,
  validateLogin,
} = require("../middlewares/validates/auth-validate-request");

const router = express.Router();

router.post("/signup", validateSignup, validateRequest, authController.signup);
router.post("/login", validateLogin, validateRequest, authController.login);
router.get("/logout", authController.logout);

module.exports = router;
