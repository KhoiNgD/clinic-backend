const { body } = require("express-validator");
const User = require("../../models/userModel");

exports.validateSignup = [
  body("name").trim().notEmpty().withMessage("Fill in your name"),
  body("email")
    .isEmail()
    .withMessage("Provide a valid email")
    .custom(async (value) => {
      const existUser = await User.findOne({ email: value });
      if (existUser) {
        return Promise.reject("Email already in use");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password length must greater than 6"),
  body("passwordConfirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

exports.validateLogin = [
  body("email").trim().notEmpty().withMessage("Fill in your email"),
  body("password").trim().notEmpty().withMessage("Fill in your password"),
];
