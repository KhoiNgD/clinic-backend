const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/", bookingController.getAllBookings);

router.use(authController.protect);

router.post(
    "/:clinicId",
    authController.restrictTo("patient"),
    bookingController.createBooking
);

router.get("/:clinicId", bookingController.getBookingsByClinic);
router.get("/:userId", bookingController.getBookingsByUser);

module.exports = router;