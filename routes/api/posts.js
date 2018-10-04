const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Post model
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @Route   GET api/posts/test
// @Desc    Tests posts route
// @Access  Public Route
router.get("/test", (req, res) => {
  res.json({
    msg: "Posts Works"
  });
});

// @Route   GET api/posts
// @Desc    Get posts
// @Access  Public Route
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts));
  res.status(404).json({ nopostsfound: "No posts found" });
});

// @Route   GET api/posts/:id
// @Desc    Get posts by id
// @Access  Public Route
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostfound: "No post found with that ID" })
    );
});

// @Route   Post api/posts
// @Desc    Create post
// @Access  Private Route
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @Route   DELETE api/posts/:id
// @Desc    Delete posts
// @Access  Private Route
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Find the user to get the profile
    Profile.findOne({ user: req.user.id }).then(profile => {
      // find the post by ID
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          // If the user IDs don't match
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: "User not authorized" });
          }
          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

module.exports = router;
