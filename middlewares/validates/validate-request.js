const ValidateError = require("../../errors/ValidateError");
const { validationResult } = require("express-validator");

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new ValidateError(errors.array()));
  }

  next();
};
