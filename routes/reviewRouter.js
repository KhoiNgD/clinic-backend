const express = require("express");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

router.use(authController.protect);

router.get("/clinic", reviewController.getClinicReviews);
router.post("/:clinicId", reviewController.createReview);
router.post("/reply/:reviewId", reviewController.createReply);

module.exports = router;
