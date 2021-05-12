const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

const clinicSchema = mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  coverImage: imageSchema,
  description: String,
  name: String,
  email: String,
  address: String,
  phone: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  schedule: [
    {
      startTime: Date,
      endTime: Date,
      dayOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
  status: {
    type: String,
    enum: ["pending", "denied", "approved"],
    default: "pending",
  },
});

const Clinic = mongoose.model("Clinic", clinicSchema);

module.exports = Clinic;
