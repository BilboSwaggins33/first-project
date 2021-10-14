var express = require("express");
var router = express.Router();
var users = require("../schemas/User");
var reviews = require("../schemas/Review");
const mongoose = require("mongoose");
/* GET home page. */
router.get("/", function (req, res, next) {
  users.findOne({ name: "Aaron Zhang" }, function (err, result) {
    res.render("index", { title: result.password });
  });
});

/* GET home page. */
router.get("/about", function (req, res, next) {
  var sum = 0;
  for (var i = 1; i < 10; i++) {
    sum = sum + i;
  }
  res.render("aboutus", { number: sum });
});

router.post("/getUser", function (req, res, next) {
  console.log(req.body);
  if (req.body.name == "titut" && req.body.pass == "12345") {
    res.send("loged in!");
  } else {
    res.send("FUCK U!");
  }
});

router.get("/review", function (req, res, next) {
  res.render("review");
});

router.post("/submit", function (req, res, next) {
  console.log(req.body);
  reviews.create(req.body, function (err, small) {
    if (err) return handleError(err);
  });
});
module.exports = router;
