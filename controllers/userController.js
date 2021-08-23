const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { cloudinary } = require("../cloudinary");
const factory = require("./handlerFactory");

exports.getUser = factory.getOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  console.log(req.file);
  const updateValues = { name, email, phone };
  const user = await User.findByIdAndUpdate(id, updateValues, { new: true });

  if (req.file) {
    user.avatar = {
      url: req.file?.path ?? "",
      filename: req.file?.filename ?? "",
    };
    await user.save();
  }

  if (req.body.deleteAvatar) {
    user.avatar = {
      url: "",
      filename: "",
    };
    await user.save();
    await cloudinary.uploader.destroy(req.body.deleteAvatar);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});
