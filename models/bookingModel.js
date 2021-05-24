const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    clinicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clinic",
    },
    bookedDate: Date,
    bookedTime: Number
}, {
    timestamps: true,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;