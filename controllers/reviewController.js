const Clinic = require("../models/clinicModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

module.exports.createReview = catchAsync(async(req, res, next) => {
    const clinic = await Clinic.findById(req.params.clinicId);
    const review = new Review(req.body);
    review.user = req.user._id;
    clinic.reviews.push(review);
    await review.save();
    await clinic.save();

    res.status(201).json({
        status: "success",
        data: {
            data: review,
        },
    });
});