const express = require("express");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

router.get("/", bookingController.getAllBookings);
router.get("/:userId", bookingController.getBookingsByUser);
router.use(authController.protect);

router.post(
  "/:clinicId",
  authController.restrictTo("patient"),
  bookingController.createBooking
);

router.get(
  "/booking-for-clinics",
  authController.protect,
  authController.restrictTo("doctor"),
  bookingController.getBookingsByClinic
);

module.exports = router;
