var mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  teacher: String,
  class: String,
  text: String,
  rateWork: String,
  rateDiff: String,
});

const reviews = mongoose.model("reviews", reviewSchema);

module.exports = reviews;
