const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load User Model
const User = require("../../models/User");

// @Route   GET api/users/test
// @Desc    Tests users route
// @Access  Public Route
router.get("/test", (req, res) => {
  res.json({
    msg: "Users Works"
  });
});

// @Route   POST api/users/register
// @Desc    Register User
// @Access  Public Route
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      //Avatar object using Gravatar API
      const avatar = gravatar.url(req.body.email, {
        s: "200", // Size of image
        r: "pg", // Rating
        d: "mm" // Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @Route   POST api/users/login
// @Desc    Login User / Returning JWT Token
// @Access  Public Route
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Find the user by email
  User.findOne({ email: email }).then(user => {
    //Check for user,
    // If no user: return 404
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }

    // Else: Check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // User Matched
        //Create JWT Payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };
        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});

// @Route   POST api/users/current
// @Desc    Return current user
// @Access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
