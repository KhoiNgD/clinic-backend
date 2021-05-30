const AppError = require("../errors/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.isAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user._id.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return next(new AppError("You do not have permission to do that!", 401));
  }
  next();
});
