const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// Load Profile Model
const Profile = require("../../models/Profile");
// Load User Model
const User = require("../../models/User");

// @Route   GET api/profile/test
// @Desc    Tests profile route
// @Access  Public Route
router.get("/test", (req, res) => {
  res.json({
    msg: "Profile Works"
  });
});

// @Route   GET api/profile
// @Desc    Get current users profile
// @Access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        // If no profile
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        // If there is a profile
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @Route   GET api/profile/all
// @Desc    Get all profiles
// @Access  Public
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: "There is no profiles" }));
});

// @Route   GET api/profile/handle/:handle
// @Desc    Get profile by handle
// @Access  Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = `There is no profile for handle`;
        res.status(404).json(errors);
      }
      // If profile does exists
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @Route   GET api/profile/user/:user_id
// @Desc    Get profile by handle
// @Access  Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = `There is no profile for this user id`;
        res.status(404).json(errors);
      }
      // If profile does exists
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// @Route   POST api/profile
// @Desc    Create or edit user profile
// @Access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields, from input form, then push into profilefields obj
    const profileFields = {};
    // Get logged in user, including avatar, email, name(req.user.id)
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }
    //Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // If profile exists ... update with new info
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // If no profile exists
        // Check if handle exists in form input
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }
          // Finally, if no error, Creat and Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @Route   POST api/profile/experience
// @Desc    Add experience to profile
// @Access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      // Add to experience array
      profile.experience.unshift(newExp);
      // Save to profile
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @Route   POST api/profile/education
// @Desc    Add education to profile
// @Access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      // Add to experience array
      profile.education.unshift(newEdu);
      // Save to profile
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @Route   DELETE api/profile/experience/:exp_id
// @Desc    Delete experience from profile
// @Access  Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get Remove Index
        const removeIndex = profile.experience
          // Map over items to only get the item id's
          .map(item => item.id)
          // Get the index of only the experience id(exp_id)
          .indexOf(req.params.exp_id);

        // Splice(Cut) out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @Route   DELETE api/profile/education/:edu_id
// @Desc    Delete education from profile
// @Access  Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get Remove Index
        const removeIndex = profile.education
          // Map over items to only get the item id's
          .map(item => item.id)
          // Get the index of only the experience id(exp_id)
          .indexOf(req.params.edu_id);

        // Splice(Cut) out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @Route   DELETE api/profile
// @Desc    Delete user and profile
// @Access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // find logged in user ... (req.user.id), call it user
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
