const mongoose = require("mongoose");

const specialistSchema = mongoose.Schema({
  name: String,
  symptoms: [String],
});

const Specialist = mongoose.model("Specialist", specialistSchema);

module.exports = Specialist;
