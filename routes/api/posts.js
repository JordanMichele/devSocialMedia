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
    .then(posts => res.json(posts))
    .catch(err => res.status(404));
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
              .status(401) // Unauthorized status
              .json({ notauthorized: "User not authorized" });
          }
          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @Route   POST api/posts/like/:id
// @Desc    Like Post
// @Access  Private Route
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Find the user to get the profile
    Profile.findOne({ user: req.user.id }).then(profile => {
      // find the post by ID
      Post.findById(req.params.id)
        .then(post => {
          // filter through likes array
          // if user ID matches like user ID, hence length being > 0
          // then
          if (
            post.likes.filter(like => like.user.id.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          // If user did not like the post
          // Add user id to likes array
          post.likes.push({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @Route   POST api/posts/unlike/:id
// @Desc    Unlike Post
// @Access  Private Route
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Find the user , .then get the profile
    Profile.findOne({ user: req.user.id }).then(profile => {
      // find the post by ID
      Post.findById(req.params.id)
        .then(post => {
          if (
            // if user hasn't like the post (.length === 0)
            // send error message
            post.likes.filter(like => like.user.id.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You Haven't like this post" });
          }

          // Get the remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id); // current user

          // Splice out of array
          post.likes.splice(removeIndex, 1);
          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @Route   POST api/posts/comment/:id
// @Desc    Add comment to post
// @Access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    // Get id from URL :id which equals req.params.id
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        post.comments.push(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "No post found" }));
  }
);

// @Route   DELETE api/posts/comment/:id/:comment_id
// @Desc    Remove comment from post
// @Access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Get id from URL :id which equals req.params.id
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          // if true the comment that's being deleted doesn't exist
          return releaseEvents
            .status(404)
            .json({ commentnotexists: "Comment does not exists" });
        }
        // If comment does exists
        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice out of array
        post.comments.splice(removeIndex, 1);
        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err =>
        res.status(404).json({ commentnotfound: "No comment found" })
      );
  }
);

module.exports = router;
