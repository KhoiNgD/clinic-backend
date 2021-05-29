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
    bookedDate: Date,
    bookedTime: Number,
    status: {
        type: String,
        enum: ["pending", "denied", "approved"],
        default: "pending",
    },
}, {
    timestamps: true,
});

bookingSchema.pre(/^find/, function(next) {
    this.populate("user").populate("clinic");
    next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;