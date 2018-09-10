const express = require("express");
const router = express.Router();

// @Route   GET api/profile/test
// @Desc    Tests profile route
// @Access  Public Route
router.get("/test", (req, res) => {
  res.json({
    msg: "Profile Works"
  });
});

module.exports = router;
