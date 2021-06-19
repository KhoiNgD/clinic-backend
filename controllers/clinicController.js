const Clinic = require("../models/clinicModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { sendClinicApprove } = require("../utils/email");
const factory = require("./handlerFactory");

exports.getAllClinics = factory.getAll(Clinic);
exports.deleteClinic = factory.deleteOne(Clinic);

exports.updateInfoClinic = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { name, email, phone, description, address, geometry } = req.body;
  const updateValues = { name, email, phone, description, address };
  const clinic = await Clinic.findOne({ email: user.email });
  const updateClinic = await Clinic.findByIdAndUpdate(
    clinic._id,
    updateValues,
    { new: true }
  );
  updateClinic.geometry = JSON.parse(geometry);
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

exports.createClinic = catchAsync(async (req, res, next) => {
  if (!req.file) return res.status(422).send("Please upload a file");
  const clinic = new Clinic(req.body);
  clinic.geometry = JSON.parse(req.body.geometry);
  clinic.coverImage = {
    url: req.file.path,
    filename: req.file.filename,
  };

  const {
    startTimeMonday,
    endTimeMonday,
    startTimeTuesday,
    endTimeTuesday,
    startTimeWednesday,
    endTimeWednesday,
    startTimeThursday,
    endTimeThursday,
    startTimeFriday,
    endTimeFriday,
    startTimeSaturday,
    endTimeSaturday,
    startTimeSunday,
    endTimeSunday,
  } = req.body;

  const mondayStartTime =
    new Date(startTimeMonday).getHours() * 60 +
    new Date(startTimeMonday).getMinutes();
  const mondayEndTime =
    new Date(endTimeMonday).getHours() * 60 +
    new Date(endTimeMonday).getMinutes();
  const tuesdayStartTime =
    new Date(startTimeTuesday).getHours() * 60 +
    new Date(startTimeTuesday).getMinutes();
  const tuesdayEndTime =
    new Date(endTimeTuesday).getHours() * 60 +
    new Date(endTimeTuesday).getMinutes();
  const wednesdayStartTime =
    new Date(startTimeWednesday).getHours() * 60 +
    new Date(startTimeWednesday).getMinutes();
  const wednesdayEndTime =
    new Date(endTimeWednesday).getHours() * 60 +
    new Date(endTimeWednesday).getMinutes();
  const thursdayStartTime =
    new Date(startTimeThursday).getHours() * 60 +
    new Date(startTimeThursday).getMinutes();
  const thursdayEndTime =
    new Date(endTimeThursday).getHours() * 60 +
    new Date(endTimeThursday).getMinutes();
  const fridayStartTime =
    new Date(startTimeFriday).getHours() * 60 +
    new Date(startTimeFriday).getMinutes();
  const fridayEndTime =
    new Date(endTimeFriday).getHours() * 60 +
    new Date(endTimeFriday).getMinutes();
  const saturdayStartTime =
    new Date(startTimeSaturday).getHours() * 60 +
    new Date(startTimeSaturday).getMinutes();
  const saturdayEndTime =
    new Date(endTimeSaturday).getHours() * 60 +
    new Date(endTimeSaturday).getMinutes();
  const sundayStartTime =
    new Date(startTimeSunday).getHours() * 60 +
    new Date(startTimeSunday).getMinutes();
  const sundayEndTime =
    new Date(endTimeSunday).getHours() * 60 +
    new Date(endTimeSunday).getMinutes();
  clinic.schedule.push(
    {
      dayOfWeek: 1,
      startTime: mondayStartTime,
      endTime: mondayEndTime,
    },
    {
      dayOfWeek: 2,
      startTime: tuesdayStartTime,
      endTime: tuesdayEndTime,
    },
    {
      dayOfWeek: 3,
      startTime: wednesdayStartTime,
      endTime: wednesdayEndTime,
    },
    {
      dayOfWeek: 4,
      startTime: thursdayStartTime,
      endTime: thursdayEndTime,
    },
    {
      dayOfWeek: 5,
      startTime: fridayStartTime,
      endTime: fridayEndTime,
    },
    {
      dayOfWeek: 6,
      startTime: saturdayStartTime,
      endTime: saturdayEndTime,
    },
    {
      dayOfWeek: 0,
      startTime: sundayStartTime,
      endTime: sundayEndTime,
    }
  );

  await clinic.save();
  res.status(201).json({
    status: "success",
    data: {
      data: clinic,
    },
  });
});
