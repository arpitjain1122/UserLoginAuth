var express = require("express");
var router = express.Router();
const userModel = require("./users");

const passport = require("passport");
const localStratergy = require("passport-local");
passport.use(new localStratergy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res) {
  res.render("index");
});

/*
router.get("/login", function (req, res) {
  // agar login ho jae toh login page ke baad profile page dikha do.
  // agar login na ho pae toh fir, mujhe is route se kisi aur route le jao jaisi ki / error and vaha pr dikhao failed. (matlab ek route se doosre route jana aur doosre route pr error dikhana)
  // flash message ka matlab server ke kisi route mein koi data banana and us data ko dossre route par paana...
});
*/

router.get("/failed", function (req, res) {
  req.flash("age", 12);
  res.send("ban gaya");
});

router.get("/checkkro", function (req, res) {
  console.log(req.flash("age"));
  res.send("check krlo backend ke terminal pe");
});

router.get("/create", async function (req, res) {
  let userData = await userModel.create({
    username: "harshi",
    nickname: "harshiiiiiiii",
    description: "hello everyone",
    categories: ["fashion", "life", "science"],
  });

  res.send(userData);
});

router.get("/find", async function (req, res) {
  // syntax -- new RegExp(search , flags);
  /*
RegExp knowledge

^ - shuruat kaisi ho 
$- ant kaisa ho

*/
  var regex = new RegExp("^Harshi$", "i"); // -How can i perform a case insensitive search on mongoose ?
  let user = await userModel.find({ username: regex });
  res.send(user);
});

// -how do I find documents where array field contains all of a set of values ?
router.get("/findcategories", async function (req, res) {
  let user = await userModel.find({ categories: { $all: ["js"] } });
  res.send(user);
});

// -How can I search for documents with a specific date range in Mongoose ?
router.get("/daterange", async function (req, res) {
  let date1 = new Date("2024-04-04");
  let date2 = new Date("2024-04-06");

  let user = await userModel.find({
    datecreated: { $gte: date1, $lte: date2 },
  });
  res.send(user);
});

// -How can I filter documents based on the existence of a filed in Mongoose ?
router.get("/exists", async function (req, res) {
  let user = await userModel.find({ categories: { $exists: true } });
  res.send(user);
});

// -How can I filter documents based on a specific field's length in mongoose ?
router.get("/fieldLength", async function (req, res) {
  let user = await userModel.find({
    $expr: {
      $and: [
        { $gte: [{ $strLenCP: "$nickname" }, 0] },
        { $lte: [{ $strLenCP: "$nickname" }, 4] },
      ],
    },
  });
  res.send(user);
});

router.get("/profile", isLoggedIn ,  function (req, res) { //protected route
  res.render("profile");
});

router.post("/register", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    secret: req.body.secret,
  });

  userModel
    .register(userdata, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { // agar app logged in ho toh aage padho
    return next();
  }

  res.redirect("/"); // varna first route pr jao
}

module.exports = router;
