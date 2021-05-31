const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    replies: [
      {
        reply: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate("user").populate({ path: "replies", populate: "user" });
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
