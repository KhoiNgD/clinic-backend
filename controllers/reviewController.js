const Clinic = require("../models/clinicModel");
const Review = require("../models/reviewModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

module.exports.createReview = catchAsync(async (req, res, next) => {
  const clinic = await Clinic.findById(req.params.clinicId);
  const review = new Review(req.body);
  review.user = req.user._id;
  clinic.reviews.push(review);
  await review.save();
  await clinic.save();

  review.user = req.user;
  res.status(201).json({
    status: "success",
    data: {
      data: review,
    },
  });
});

exports.createReply = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const review = await Review.findById(reviewId);
  review.replies.push({ reply, user: req.user._id });
  await review.save();

  res.status(201).json({
    status: "success",
    data: {
      data: review,
    },
  });
});

exports.getClinicReviews = catchAsync(async (req, res, next) => {
  const reviews = await Clinic.findOne({ email: req.user.email })
    .select("reviews")
    .lean();

  res.status(201).json({
    status: "success",
    results: reviews.length,
    data: {
      data: reviews,
    },
  });
});
