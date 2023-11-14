const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    res.render("home.ejs", { user: req.user });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
