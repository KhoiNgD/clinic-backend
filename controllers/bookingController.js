const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllBookings = catchAsync(async(req, res, next) => {
    const bookings = await Booking.find({});

    res.status(200).json({
        status: "success",
        results: bookings.length,
        data: {
            data: bookings,
        },
    });
});

exports.createBooking = catchAsync(async(req, res, next) => {
    const { clinicId } = req.params;
    const { bookedDate, bookedTime } = req.body;
    const booking = new Booking();
    booking.bookedDate = bookedDate;
    booking.bookedTime =
        new Date(bookedTime).getHours() * 60 + new Date(bookedTime).getMinutes();
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
            data: bookings,
        },
    });
});

exports.getBookingsByClinic = catchAsync(async(req, res, next) => {
    const { clinicId } = req.params;

    const bookings = Booking.find({ clinicId });

    res.status(201).json({
        status: "success",
        data: {
            data: bookings,
        },
    });
});