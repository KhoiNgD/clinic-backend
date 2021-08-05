const Clinic = require("../models/clinicModel");
const User = require("../models/userModel");
const Specialist = require("../models/specialistModel");
const catchAsync = require("../utils/catchAsync");
const { createScheduleClinic } = require("../utils/createScheduleClinic");
const { sendClinicApprove } = require("../utils/email");
const factory = require("./handlerFactory");

exports.getAllClinics = factory.getAll(Clinic);
exports.deleteClinic = factory.deleteOne(Clinic);

exports.updateInfoClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { geometry, ...updateValues } = req.body;
  const updateClinic = await Clinic.findOneAndUpdate(
    { email: user.email },
    updateValues,
    {
      new: true,
      projection: { reviews: 0, schedule: 0, __v: 0 },
      // fields: "coverImage name phone email description address geometry",
    }
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

exports.getScheduleClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email })
    .select("schedule -reviews -_id")
    .lean();
  clinic.schedule.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  res.status(200).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});

exports.getClinicByToken = catchAsync(async (req, res, next) => {
  const user = req.user;
  const clinic = await Clinic.findOne({ email: user.email })
    .select("-_id -__v -schedule -reviews -status")
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
  const clinics = await Clinic.getNearestClinics(lng, lat);

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
  symptoms = symptoms.includes(",")
    ? symptoms.split(",").map((symptom) => capitalFirstLetter(symptom))
    : symptoms;
  const specialists = await Specialist.find({
    symptoms: { $in: symptoms },
  }).select("_id");
  const specialistIds = specialists.map((spec) => spec._id);

  const clinics = await Clinic.find({
    specialists: { $in: specialistIds },
    status: "approved",
  });

  res.status(200).json({
    status: "success",
    data: {
      data: clinics,
    },
  });
});

exports.createClinic = catchAsync(async (req, res, next) => {
  if (!req.file) return res.status(422).send("Please upload a file");
  const clinic = new Clinic(req.body);
  clinic.geometry = JSON.parse(req.body.geometry);
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
