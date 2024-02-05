const User = require("../ models/user");

// const mongodb = require("mongodb");
// const ObjectID = mongodb.ObjectId;
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult }=require('express-validator');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "iamvimal107@gmail.com",
    pass: "ftjr qtzn gisp aokh",
  },
});

exports.postSignUp = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors= validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('index',{
      errorMessage:errors.array()[0].msg,
      oldInput:{
        name:name,
        email:email,
        password:password
      }
    });
  }
  
      return bcryptjs
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
          });
          return user.save();
        })
        .then((result) => {
          let otp = "";
          for (let i = 1; i <= 6; i++) {
            otp += Math.round(Math.random() * 9).toString();
          }
          req.flash("otp", `${otp}`);
          req.flash("throughSignup", "true");
          res.redirect("/user/login");
          const mailOptions = {
            from: "iamvimal107@gmail.com",
            to: email,
            subject: `SignUp Successful!!!`,
            text: `Hello ${name}!
Welcome to Our Website!!
This is Your One Time Password For Login ${otp}`,
          };
          return transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log(info);
          });
        });
};

exports.getSignUpPage = (req, res, next) => {
  res.status(302).redirect("/");
};

exports.getLoginPage = (req, res, next) => {
  let message = req.flash("error");
  // console.log("error is", message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const sign = req.flash("throughSignup")[0];
  console.log(sign);
  res.status(200).render("login", {
    pageTitle: "Login",
    errorMessage: message,
    throughSignup: sign,
    oldInput:{
      email:"",
      password:""
    }
  });
};
exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const otp = req.body.otp;
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(422).render('login', {
        errorMessage: errors.array()[0].msg,
        pageTitle:"Login",
        throughSignup: false,
        oldInput: {
          email: email,
          password: password,
          otp: otp
        }
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).render('login', {
        errorMessage: "Invalid email or password",
        pageTitle:"Login",
        throughSignup: false,
        oldInput: {
          email: email,
          password: password,
          otp: otp
        }
      });
    }

    const doMatch = await bcryptjs.compare(password, user.password);

    if (otp !== "noOtp") {
      const originalOTP = req.flash("otp");

      if (doMatch && otp == originalOTP[0]) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save();
        return res.redirect("/admin/add-player");
      } else {
        return res.status(422).render('login', {
          errorMessage: "Invalid email, password, or OTP",
          pageTitle:"Login",
          throughSignup: false,
          oldInput: {
            email: email,
            password: password,
            otp: otp
          }
        });
      }
    } else if (doMatch && otp === "noOtp") {
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save();
      return res.redirect("/admin/add-player");
    } else {
      return res.status(422).render('login', {
        pageTitle:"Login",
        throughSignup: false,
        errorMessage: "Invalid email or password",
        oldInput: {
          email: email,
          password: password,
          otp: otp
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
};

// exports.postLogin = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const otp=req.body.otp;
//     const user = User.findOne({ email: email }).then((noUser)=>{
//     if (!user) {
//       req.flash("error", "Invalid Email or Password");
//       return res.redirect("/user/login");
//  }
// })
//     const doMatch = bcryptjs.compare(password, user.password).then(res=>{
//     if (otp!=="noOtp") {
//       const otp = req.body.otp;
//       console.log(otp);
//       const originalOTP = req.flash("otp");
//       console.log("OTP Generated is", originalOTP);
//       if (doMatch && otp == originalOTP[0]) {
//         req.session.isLoggedIn = true;
//         req.session.user = user;
//         await req.session.save();
//         console.log("stored!!");
//         return res.redirect("/admin/add-player");
//       }
//       else {
//         req.flash("error", "Invalid password or OTP");
//         return res.redirect("/user/login");
//       }
//     }
//     else if (doMatch &&  otp === "noOtp") {
//         console.log(req.body.otp);
//         req.session.isLoggedIn = true;
//         req.session.user = user;
//         await req.session.save();
//         console.log("stored!!");
//         return res.redirect("/admin/add-player");
//       }
//     else {
//         req.flash("error", "Invalid password or OTP");
//         return res.redirect("/user/login");
//     }
// })
//  .catch (err) {
//     console.log(err);
//   }
// };

exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  // console.log("error is", message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("reset-password", {
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("user/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Account with this Email");
          return res.redirect("/user/reset-password");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        req.flash("error", "Email Sent Succesfully!!");
        return user.save();
      })
      .then((result) => {
        // const name=req.user.name;
        // console.log(name);
        res.redirect("/user/login");
        const mailOptions = {
          from: "iamvimal107@gmail.com",
          to: req.body.email,
          subject: `Reset Your Password!!`,
          html: `<p>Hello !</p>
<p>Thank You for Contacting Us!!</p>
<p>Feeling Bad Forgetting Your Password?</p>
<p>No Worries!! We are here to help you reset your password.</p>
<p>Just Click the below Link to Set a New Password.</p>
<a href="http://localhost:8000/user/reset-password/${token}">Click Here</a>`,
        };
        return transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log(info);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  console.log("token is", token);
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      console.log(user);
      let message = req.flash("error");
      // console.log("error is", message);
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("new-password", {
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newpassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.token;
  console.log(newpassword, userId, passwordToken);
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.redirect("/");
      }
      resetUser = user;
      console.log(resetUser);
      return bcryptjs.hash(newpassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/user/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
