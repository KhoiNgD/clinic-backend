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
  image_url: imageSchema,
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
  appointments: [
    {
      ticket: Number,
      state_time: Date,
      end_time: Date,
    },
  ],
});

const Clinic = mongoose.model("Clinic", clinicSchema);

module.exports = Clinic;
