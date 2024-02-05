// routes/user.js

const express = require("express");
const router = express.Router();
const userHandlerController = require("../controllers/user");
const { check, body } = require("express-validator");
const User = require("../ models/user");

router.get("/signup", userHandlerController.getSignUpPage);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a Valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail already exists");
          }
        });
      }),
      body(
        "password",
        "Please Enter a password with Minimum 5 characters containing letters, numbers, or special characters"
      )
        .isLength({ min: 5 })
        .matches(/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/)
        .trim(),
    body("name")
      .matches(/^[A-Za-z\s]+$/)
      .withMessage("Please Enter a Valid Name"),
  ],
  userHandlerController.postSignUp
);
router.get("/login", userHandlerController.getLoginPage);
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please Enter a Valid Email"),
    body(
      "password",
      "Please Enter a password with Minimum 5 characters containing letters and numbers only"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  userHandlerController.postLogin
);
router.get("/logout", userHandlerController.getLogout);
router.get("/reset-password", userHandlerController.getResetPassword);
router.post("/reset-password", userHandlerController.postResetPassword);
router.get("/reset-password/:token", userHandlerController.getNewPassword);
router.post("/update-password", userHandlerController.postNewPassword);

module.exports = router;
