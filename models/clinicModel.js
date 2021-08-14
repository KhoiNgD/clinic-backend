const mongoose = require("mongoose");

const imageSchema = mongoose.Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

const clinicSchema = mongoose.Schema(
  {
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
    specialists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialist",
      },
    ],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
    schedule: [
      {
        workingHours: [
          {
            startTime: Number,
            endTime: Number,
          },
        ],
        dayOfWeek: {
          type: Number,
          enum: [0, 1, 2, 3, 4, 5, 6],
        },
      },
    ],
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "denied", "approved"],
      default: "pending",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

clinicSchema.index({ geometry: "2dsphere" });

clinicSchema.virtual("reviewCount").get(function () {
  return this?.reviews?.length ?? undefined;
});

clinicSchema.virtual("ratingAvg").get(function () {
  if (!this.reviews) {
    return undefined;
  }
  if (!this.reviews.length) {
    return 0;
  }
  return (
    this.reviews.reduce((count, review) => count + review.rating, 0) /
    this.reviews.length
  );
});

clinicSchema.pre(/^find/, function (next) {
  this.select("-schedule.workingHours._id -schedule._id -__v");
  this.populate({ path: "reviews", populate: "user" }).populate({
    path: "specialists",
    select: "name",
  });
  next();
});

const Clinic = mongoose.model("Clinic", clinicSchema);

module.exports = Clinic;
