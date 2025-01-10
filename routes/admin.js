const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const { hashSync } = require("bcryptjs");
const { ensureAuthenticated } = require("../middleware/protect");

router.get("/", (req, res) => {
  res.render("profile.ejs");
});
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({
      username,
      email,
      password: hashSync(password, 10),
    });
    user.save().then((user) => {
      console.log(user);
      res.redirect("/login");
    });
  } catch (error) {
    console.log("registration error", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: "Incorrect username and password",
  }),
  (req, res) => {
    console.log(req.session);
  }
);

router.get("/", ensureAuthenticated, (req, res) => {
  res.send("welcome to the profile page user ");
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
