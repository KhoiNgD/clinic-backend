const Booking = require("../models/bookingModel");
const Clinic = require("../models/clinicModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({});

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      data: bookings,
    },
  });
});

exports.createBooking = catchAsync(async (req, res, next) => {
  const { clinicId } = req.params;
  const { bookedDate, bookedTime } = req.body;
  console.log(bookedDate);
  console.log(bookedTime);
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

exports.getBookings = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);

  let bookings;
  if (user.role === "doctor") {
    const clinic = await Clinic.findOne({ email: req.user.email });
    bookings = await Booking.find({ clinic: clinic._id });
  }
  if (user.role === "patient") {
    bookings = await Booking.find({ user: id });
  }

  res.status(201).json({
    status: "success",
    data: {
      data: bookings,
    },
  });
});
