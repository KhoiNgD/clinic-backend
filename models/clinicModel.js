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
  image: imageSchema,
  description: String,
  name: String,
  address: String,
  phone: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ["pending", "denied", "approved"],
    default: "pending",
  },
});

const Clinic = mongoose.model("Clinic", clinicSchema);

module.exports = Clinic;
