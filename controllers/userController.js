const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const { cloudinary } = require("../cloudinary");
const factory = require("./handlerFactory");

exports.getUser = factory.getOne(User);

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const updateValues = { name, email, phone };
  const user = User.findByIdAndUpdate(id, updateValues);

  user.avatar = {
    url: req.file
      ? req.file?.path
      : "https://res.cloudinary.com/dxqljhtd4/image/upload/v1622340763/Clinic/default-avatar_hblknx.jpg",
    filename: req.file ? req.file.filename : "default-avatar_hblknx.jpg",
  };
  await user.save();

  if (req.body.deleteAvatar) {
    await cloudinary.uploader.destroy(req.body.deleteAvatar);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});
