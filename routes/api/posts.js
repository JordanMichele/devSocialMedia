const express = require("express");
const router = express.Router();

// @Route   GET api/posts/test
// @Desc    Tests posts route
// @Access  Public Route
router.get("/test", (req, res) => {
  res.json({
    msg: "Posts Works"
  });
});

module.exports = router;
