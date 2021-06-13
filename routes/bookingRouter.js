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

// Get booking by User via token
router.get("/users", bookingController.getBookings);
router.get(
  "/users/stats",
  authController.restrictTo("doctor"),
  bookingController.getBookedUsersByClinic
);

module.exports = router;
