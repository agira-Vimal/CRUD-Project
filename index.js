const express = require("express");
const app = express();

const adminHandler = require("./routes/admin");
const userHandler = require("./routes/user");
const User = require("./ models/user");

const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const store = new mongoDBStore({
  uri: "mongodb+srv://Vimal-R:v6HPNiTP4bAEHZp3@cluster0.dfghwz6.mongodb.net/players",
  collection: "sessions",
});

const csrfProtection = csrf();

app.use(express.urlencoded({ extended: false }));

app.set("views", "views");
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // console.log(req.session._id)
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminHandler);
app.use("/user", userHandler);

app.get("/", (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.status(200).render("index", { errorMessage: message ,oldInput:{
    name:'',
    email:'',
    password:''
  }});
});

mongoose
  .connect(
    "mongodb+srv://Vimal-R:v6HPNiTP4bAEHZp3@cluster0.dfghwz6.mongodb.net/players?retryWrites=true&w=majority"
  )
  .then((res) => {
    console.log("listening");
    app.listen(8000);
  })
  .catch((err) => console.log(err));
