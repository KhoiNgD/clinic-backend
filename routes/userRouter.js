const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const {
  validateRequest,
} = require("../middlewares/validates/validate-request");
const {
  validateSignup,
  validateLogin,
} = require("../middlewares/validates/auth-validate-request");
const { isAuthor } = require("../middlewares");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router.post("/signup", validateSignup, validateRequest, authController.signup);
router.post("/login", validateLogin, validateRequest, authController.login);
router.get("/logout", authController.logout);
router.get("/current-user", authController.getCurrentUser);

router.use(authController.protect);
router.patch("/updatePassword", authController.updatePassword);
router
  .route("/:id")
  .get(userController.getUser)
  .put(isAuthor, upload.single("avatar"), userController.updateUser);

module.exports = router;
