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
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const router = express.Router();

router.post("/signup", validateSignup, validateRequest, authController.signup);
router.post("/login", validateLogin, validateRequest, authController.login);
router.get("/logout", authController.logout);

router
    .route("/")
    .get(userController.getAllUsers)

router
    .route("/:id")
    .get(userController.getUser)
    .patch(upload.single("coverImage"), userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;