const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clinic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clinic",
  },
  ticket_booked: Number,
  start_time: Date,
  end_time: Date,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
