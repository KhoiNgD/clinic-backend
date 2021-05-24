const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllBookings = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.createBooking = catchAsync(async(req, res, next) => {
    const { clinicId } = req.params;

    const booking = new Booking(req.body);
    booking.user = req.user._id;
    booking.clinic = clinicId;
    await booking.save();

    res.status(201).json({
        status: "success",
        data: {
            data: booking,
        },
    });
});

exports.getBookingsByUser = catchAsync(async(req, res, next) => {
    const { userId } = req.params;

    const bookings = Booking.find({ userId });

    res.status(201).json({
        status: "success",
        data: {
            data: bookings
        }
    })
})

exports.getBookingsByClinic = catchAsync(async(req, res, next) => {
    const { clinicId } = req.params;

    const bookings = Booking.find({ clinicId });

    res.status(201).json({
        status: "success",
        data: {
            data: bookings
        }
    })
})