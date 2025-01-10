const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

router.get("/forgot-password", (req, res) => {
  res.render("forgetpw.ejs");
});

router.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  res.render("resetpassword.ejs", { token });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect("/forgot-password");
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetURL = `http://localhost:3000/reset-password/${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this email because you (or someone else) requested to reset your password.
  Click the link below to reset your password:
  ${resetURL}
  If you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);

    res.redirect("/forgot-password");
  } catch (error) {
    res.redirect("/forgot-password");
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect("/forgot-password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error during password reset:", error);
    res.redirect(`/reset-password/${token}`);
  }
});

module.exports = router;
