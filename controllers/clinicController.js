const Clinic = require("../models/clinicModel");
const User = require("../models/userModel");
const Specialist = require("../models/specialistModel");
const catchAsync = require("../utils/catchAsync");
const { createScheduleClinic } = require("../utils/createScheduleClinic");
const { capitalFirstLetter } = require("../utils/formatText");
const { sendClinicApprove } = require("../utils/email");
const factory = require("./handlerFactory");
const Booking = require("../models/bookingModel");

exports.getAllClinics = factory.getAll(Clinic);
exports.deleteClinic = factory.deleteOne(Clinic);

exports.updateInfoClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { specialists, geometry, ...updateValues } = req.body;
  const updateClinic = await Clinic.findOneAndUpdate(
    { email: user.email },
    updateValues,
    {
      new: true,
      projection: { reviews: 0, __v: 0 },
      // fields: "coverImage name phone email description address geometry",
    }
  );

  updateClinic.specialists = [];
  const specialistsArr = JSON.parse(specialists);
  specialistsArr.forEach((specialistId) =>
    updateClinic.specialists.push(specialistId)
  );

  geometry && (updateClinic.geometry = JSON.parse(geometry));

  req.file &&
    (updateClinic.coverImage = {
      url: req.file?.path ?? "",
      filename: req.file?.filename ?? "",
    });
  await updateClinic.save();

  if (req.body.deleteCoverImage) {
    await cloudinary.uploader.destroy(req.body.deleteAvatar);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: updateClinic,
    },
  });
});

exports.updateScheduleClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email });
  clinic.schedule = [];
  const scheduleInput = createScheduleClinic(req);
  clinic.schedule.push(...scheduleInput);
  await clinic.save();

  res.status(201).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});

exports.updateStatusClinic = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const clinic = await Clinic.findByIdAndUpdate(id, req.body, { new: true });
  if (req.body.status === "approved") {
    const user = await User.findOne({ email: clinic.email });
    if (user) {
      const passwordGenerated = Math.random().toString(36).slice(-8);
      const newUser = new User();
      newUser.name = clinic.name;
      newUser.email = clinic.email;
      newUser.password = passwordGenerated;
      newUser.role = "doctor";
      newUser.save();
      // Send email
      try {
        await sendClinicApprove(newUser, passwordGenerated);
      } catch (error) {
        return next(
          new AppError(
            "There was an error sending the email. Try again later!"
          ),
          500
        );
      }
    }
  }
  res.status(200).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});

exports.getClinic = catchAsync(async (req, res, next) => {
  const clinic = await Clinic.findById(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});

exports.getClinicStatistic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email });
  const bookings = await Booking.find({ clinic: clinic._id }).select(
    "-_id user"
  );
  const bookingUsers = bookings.filter(
    (booking, index, self) =>
      index ===
      self.findIndex(
        (t) => t.place === booking.place && t.name === booking.name
      )
  ).length;
  const statistic = {};
  statistic.ratings = clinic.reviews.reduce(
    (count, review) => count + review.rating,
    0
  );
  statistic.totalPatients = bookingUsers;
  res.status(200).json({
    status: "success",
    data: statistic,
  });
});

exports.getScheduleClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email })
    .select("-reviews -_id")
    .lean();

  res.status(200).json({
    status: "success",
    data: {
      data: clinic.schedule,
    },
  });
});

exports.getClinicByToken = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email })
    .select("-_id -reviews -status")
    .lean();

  res.status(200).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});

exports.getApprovedClinics = catchAsync(async (req, res, next) => {
  const clinics = await Clinic.find({ status: "approved" });

  res.status(200).json({
    status: "success",
    results: clinics.length,
    data: {
      data: clinics,
    },
  });
});

exports.getNearestClinics = catchAsync(async (req, res, next) => {
  const { lng, lat } = req.query;
  const clinics = await Clinic.aggregate([
    {
      $geoNear: {
        key: "geometry",
        near: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        distanceField: "dist.calculated",
        query: { status: "approved" },
        uniqueDocs: true,
        spherials: true,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    found: clinics.length,
    data: {
      data: clinics,
    },
  });
});

exports.getClinicsBySymptoms = catchAsync(async (req, res, next) => {
  let { symptoms } = req.query;
  let clinics;
  if (!symptoms) {
    clinics = await Clinic.find({ status: "approved" });
  } else {
    symptoms = symptoms.includes(",")
      ? symptoms.split(",").map((symptom) => capitalFirstLetter(symptom))
      : symptoms;
    const specialists = await Specialist.find({
      symptoms: { $in: symptoms },
    }).select("_id");
    const specialistIds = specialists.map((spec) => spec._id);
    clinics = await Clinic.find({
      specialists: { $in: specialistIds },
      status: "approved",
    });
  }

  res.status(200).json({
    status: "success",
    results: clinics.length,
    data: {
      data: clinics,
    },
  });
});

exports.createClinic = catchAsync(async (req, res, next) => {
  if (!req.file) return res.status(422).send("Please upload a file");
  const { specialists, geometry, ...body } = req.body;
  const clinic = new Clinic(body);
  const specialistsArr = JSON.parse(specialists);
  specialistsArr.forEach((specialistId) =>
    clinic.specialists.push(specialistId)
  );
  clinic.geometry = JSON.parse(geometry);
  clinic.coverImage = {
    url: req.file.path,
    filename: req.file.filename,
  };

  const scheduleInput = createScheduleClinic(req);
  clinic.schedule.push(...scheduleInput);

  await clinic.save();
  res.status(201).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});
