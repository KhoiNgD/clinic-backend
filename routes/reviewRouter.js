const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.use(authController.protect);

router.post("/:clinicId", reviewController.createReview);

module.exports = router;
