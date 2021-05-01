const AppError = require("../errors/AppError");
const ValidateError = require("../errors/ValidateError");

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error("ERROR 💥", err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

module.exports = (err, req, res, next) => {
  if (err instanceof ValidateError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name === "ValidationError") {
    err = handleValidationErrorDB(err);
    console.log(err);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  }
};
