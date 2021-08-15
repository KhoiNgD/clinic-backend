const Booking = require("../models/bookingModel");
const Clinic = require("../models/clinicModel");
const AppError = require("../errors/AppError");
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
  const userId = req.user._id;
  const { clinicId } = req.params;
  const { bookedDate, bookedTime } = req.body;

  const convertDateToTimeNumber = (date) =>
    new Date(date).getHours() * 60 + new Date(date).getMinutes();

  // Check if there is pending appointment
  // between user and clinic
  const pendingBooking = await Booking.findOne({
    $and: [{ clinic: clinicId }, { user: userId }, { status: "pending" }],
  });
  if (pendingBooking) {
    const now = new Date(Date.now());

    // Check if user booking time is after pending appointment
    const isAfterPendingAppointment =
      now.setHours(0, 0, 0, 0) >= new Date(bookedDate).setHours(0, 0, 0, 0) &&
      convertDateToTimeNumber(now) > convertDateToTimeNumber(bookedTime);

    if (isAfterPendingAppointment) {
      pendingBooking.status = "denied";
      await pendingBooking.save();
    } else {
      return res.status(409).json({
        status: "fail",
        message: "Unable to book an appointment. You have a pending request.",
      });
    }
  }

  const booking = new Booking();
  booking.bookedDate = new Date(bookedDate);
  booking.bookedTime = convertDateToTimeNumber(bookedTime);
  booking.user = userId;
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
  const user = req.user;

  let bookings;
  if (user.role === "doctor") {
    const clinic = await Clinic.findOne({ email: user.email });
    bookings = await Booking.find({ clinic: clinic._id })
      .select("-clinic -__v")
      .populate("user", "-role -__v");
    bookings.ratingAvg = clinic.ratingAvg;
  }
  if (user.role === "patient") {
    bookings = await Booking.find({ user: user._id })
      .select("-user -__v")
      .populate("clinic")
      .lean();
  }

  res.status(201).json({
    status: "success",
    data: {
      data: bookings,
    },
  });
});

exports.getBookedUsersByClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email });
  const users = await Booking.aggregate([
    {
      $match: { clinic: clinic._id },
    },
    {
      $group: {
        _id: "$user",
        totalBooking: { $sum: 1 },
        user: { $push: "$user" },
      },
    },
    {
      $sort: { totalBooking: -1 },
    },
  ]);
  await Booking.populate(users, { path: "user", select: "-__v" });

  res.status(201).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.updateStatusBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndUpdate(id, req.body, { new: true });
  res.status(200).json({
    status: "success",
    data: {
      data: booking,
    },
  });
});
