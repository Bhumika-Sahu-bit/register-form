const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoURI = process.env.mongoURI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

app.use(flash());

//view engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI,
      collectionName: "session",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const adminRoutes = require("./routes/admin");
const forgetRoutes = require("./routes/forget");

app.use("/", adminRoutes);
app.use("/", forgetRoutes);

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
