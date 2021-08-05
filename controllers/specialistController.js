const Specialist = require("../models/specialistModel");
const catchAsync = require("../utils/catchAsync");
const { capitalFirstLetter } = require("../utils/formatText");

exports.getAllSpecialists = catchAsync(async (req, res, next) => {
  const specialists = await Specialist.find({}).select("-symptoms -__v");

  res.status(200).json({
    status: "success",
    data: {
      data: specialists,
    },
  });
});

exports.getAllSymptoms = catchAsync(async (req, res, next) => {
  const specialists = await Specialist.find({}).select("symptoms");
  const symptoms = specialists.reduce(
    (accumulator, currentValue) => [...accumulator, ...currentValue.symptoms],
    []
  );

  res.status(200).json({
    status: "success",
    result: symptoms.length,
    data: {
      data: symptoms,
    },
  });
});

exports.getSymptomsByDiagnosis = catchAsync(async (req, res, next) => {
  const { diagnosis } = req.query;
  const diagnosisObj = {};
  diagnosis
    .split(" ")
    .forEach(
      (item) =>
        (diagnosisObj[item.toLowerCase()] =
          diagnosisObj[item.toLowerCase()]++ || 0)
    );
  const specialists = await Specialist.find({}).select("symptoms");
  let symptoms = specialists.reduce(
    (accumulator, currentValue) => [...accumulator, ...currentValue.symptoms],
    []
  );
  const result = [];
  let max = 0;
  symptoms.forEach((symptom) => {
    let count = 0;
    symptom
      .split(" ")
      .forEach(
        (item) => diagnosisObj.hasOwnProperty(item.toLowerCase()) && count++
      );
    if (count === max) result.push(symptom);
    if (count > max) {
      max = count;
      result.length = 0;
      result.push(symptom);
    }
  });

  res.status(200).json({
    status: "success",
    result: result.length,
    data: {
      data: result,
    },
  });
});

exports.getBySymptoms = catchAsync(async (req, res, next) => {
  let { symptoms } = req.query;
  symptoms = symptoms.includes(",")
    ? symptoms.split(",").map((symptom) => capitalFirstLetter(symptom))
    : symptoms;
  const specialists = await Specialist.find({ symptoms: { $in: symptoms } });

  res.status(200).json({
    status: "success",
    data: {
      data: specialists,
    },
  });
});

exports.createSpecialist = catchAsync(async (req, res, next) => {
  let { name, symptoms } = req.body;
  name = capitalFirstLetter(name);
  symptoms = symptoms.map((symptom) => capitalFirstLetter(symptom));

  const specialist = new Specialist({ name, symptoms });
  await specialist.save();

  res.status(201).json({
    status: "success",
    data: {
      data: specialist,
    },
  });
});

exports.updateSymptoms = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { symptoms } = req.body;
  const specialist = await Specialist.findByIdAndUpdate(
    id,
    { symptoms },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      data: specialist,
    },
  });
});
