const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
    },
    ticket_booked: {
      type: Number,
      default: 0,
    },
    start_time: Date,
    end_time: Date,
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("save", async function (next) {
  const totalBookings = await Booking.count({ clinic: this.clinic });
  Booking.findByIdAndUpdate(
    { _id: this._id },
    { $set: { ticket_booked: totalBookings + 1 } },
    function (error) {
      if (error) return next(error);
      next();
    }
  );
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
