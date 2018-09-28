const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id) //gives us a promise
        .then(user => {
          //if user has been found
          if (user) {
            // return user (null(because no error), user because there is a user)
            return done(null, user);
          }
          // if no user (null(because no error, false because there is no user)
          return done(null, false);
        })
        // if something goes wrong ... log it
        .catch(err => console.log(err));
    })
  );
};
