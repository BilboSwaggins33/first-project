var express = require("express");
var router = express.Router();
var users = require("../schemas/User");
var reviews = require("../schemas/Review");
const mongoose = require("mongoose");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

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
    res.send("logged in!");
  } else {
    res.send("FUCK U!");
  }
});

router.get("/review", function (req, res, next) {
  res.render("review");
});

router.post("/viewreview", function (req, res, next) {
  console.log(req.body);
  res.render("viewreview");
});

router.get("/view/:id", function (req, res, next) {
  //console.log(req.params.id);
  var params = req.params.id;
  reviews.find({}).exec(function (err, docs) {
    var reviewTotals = {};
    var workTotals = {};
    var diffTotals = {};
    docs.forEach(function (x) {
      reviewTotals[x.class] = (reviewTotals[x.class] || 0) + 1;
      if (x.class in workTotals) {
        workTotals[x.class] += parseFloat(x.rateWork);
        diffTotals[x.class] += parseFloat(x.rateDiff);
      } else {
        workTotals[x.class] = 0;
        diffTotals[x.class] = 0;
        workTotals[x.class] += parseFloat(x.rateWork);
        diffTotals[x.class] += parseFloat(x.rateDiff);
      }
    });
    var countWork = {};
    var countDiff = {};
    var counts = [];
    for (var key in workTotals) {
      countWork[key] = parseFloat(workTotals[key] / reviewTotals[key]).toFixed(2);
      countDiff[key] = parseFloat(diffTotals[key] / reviewTotals[key]).toFixed(2);
      counts.push({
        class: key,
        diff: countDiff[key],
        work: countWork[key],
        reviews: reviewTotals[key],
      });
    }
    //console.log(counts);
    if (params == "mostReviewed") {
      counts = counts.sort((a, b) => (a.reviews < b.reviews ? 1 : -1));
    } else if (params == "leastReviewed") {
      counts = counts.sort((a, b) => (a.reviews > b.reviews ? 1 : -1));
    } else if (params == "Workload") {
      counts = counts.sort((a, b) => (a.work < b.work ? 1 : -1));
    } else if (params == "leastWorkload") {
      counts = counts.sort((a, b) => (a.work > b.work ? 1 : -1));
    } else if (params == "Difficult") {
      counts = counts.sort((a, b) => (a.diff < b.diff ? 1 : -1));
    } else if (params == "leastDifficult") {
      counts = counts.sort((a, b) => (a.diff > b.diff ? 1 : -1));
    }

    res.render("filter", {
      results: counts,
      sortParam: params,
    });
  });
});
//console.log(revs);

router.post("/submit", function (req, res, next) {
  //console.log(req.body);
  reviews.create(req.body, function (err, small) {
    if (err) return handleError(err);
  });
  res.render("index");
});

module.exports = router;
