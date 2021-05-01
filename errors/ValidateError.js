class ValidateError extends Error {
  constructor(errors) {
    super();
    this.statusCode = 400;
    this.message = "Invalid request parameters";
    this.errors = errors;
  }

  serializeErrors() {
    return this.errors.map((error) => {
      return { message: error.msg, field: error.param };
    });
  }
}

module.exports = ValidateError;
