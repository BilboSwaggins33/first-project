var express = require("express");
var router = express.Router();
var axios = require("axios");
var reviews = require("../schemas/Review");
var WordPOS = require("wordpos"),
  wordpos = new WordPOS();
var Analyzer = require("natural").SentimentAnalyzer;
var stemmer = require("natural").PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");
const teachers = require("../script/teachers.json")
const array = require("../script/classes.js")
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/adjResults", function (req, res, next) {
  console.log(req.query);
  reviews.find({}).exec(function (err, docs) {
    var text = [];
    docs.forEach(function (x) {
      wordpos.getPOS(x.text, function (o) {
        text.push({
          class: x.class,
          text: [...o.adverbs, ...o.adjectives, ...o.verbs],
          sentiment: analyzer.getSentiment(x.text.split(" ")),
        });
      });
    });
    axios.get("https://api.datamuse.com/words?ml=" + req.query.a + "&max=750&p=adj").then(function (result) {
      var synonyms = result.data;
      var slits = [];
      var match = [];
      synonyms.forEach(function (x) {
        slits.push(x.word);
      });
      text.forEach(function (a) {
        match.push({ class: a.class, n: slits.filter((x) => a.text.includes(x)).length, sentiment: a.sentiment });
      });
      var final = [];
      match.forEach(function (a) {
        if (!this[a.class]) {
          this[a.class] = { class: a.class, n: 0, sentiment: 0, numReviews: 0, overallVal: 0 };
          final.push(this[a.class]);
        }
        this[a.class].n += a.n;
        this[a.class].sentiment += a.sentiment;
        this[a.class].numReviews += 1;
      }, Object.create(null));
      final.forEach(function (a) {
        let ad = analyzer.getSentiment([req.query.a]);
        a.n = a.n / a.numReviews == 0 ? 1 : a.n / a.numReviews;
        a.sentiment = a.sentiment / a.numReviews;
        a.overallVal = Math.abs(ad - a.sentiment) / 2 + 2 / a.n;
        // console.log("Sentiment Diff:", ad - a.sentiment, "n:", a.n, "n-contr", 2 / a.n, "overall:", a.overallVal);
      });
      final = final.sort((a, b) => (a.overallVal > b.overallVal ? 1 : -1));
      res.render("adjResults", { text: final, synonyms: synonyms });
    });
  });
});

router.get("/about", function (req, res, next) {
  var sum = 0;
  for (var i = 1; i < 10; i++) {
    sum = sum + i;
  }
  res.render("aboutus", { number: sum });
});

router.post("/getUser", function (req, res, next) {
  if (req.body.name == "titut" && req.body.pass == "12345") {
    res.send("logged in!");
  } else {
    res.send("login failed");
  }
});

router.get("/review", function (req, res, next) {
  res.render("review", { teachers: teachers, classes: array.classes });
});

router.post("/viewReview", function (req, res, next) {
  reviews.find({ class: req.body.submitData }).exec(function (err, docs) {
    res.render("viewReview", { r: docs });
  });
});

router.get("/view/:id", function (req, res, next) {
  var params = req.params.id;
  reviews.find({}).exec(function (err, docs) {
    var reviewTotals = {};
    var workTotals = {};
    var diffTotals = {};
    var teacherTotals = {}
    docs.forEach(function (x) {
      reviewTotals[x.class] = (reviewTotals[x.class] || 0) + 1;
      Object.keys(teacherTotals).includes(x.class) ? teacherTotals[x.class].push(x.teacher) : teacherTotals[x.class] = [x.teacher]
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
        teacher: teacherTotals[key],
        diff: countDiff[key],
        work: countWork[key],
        reviews: reviewTotals[key],
      });
    }
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
  console.log(req.body);
  reviews.create(req.body, function (err, small) {
    if (err) return handleError(err);
  });
  res.render("index");
});

module.exports = router;
