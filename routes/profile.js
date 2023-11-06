const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    let user = req.user;
    if (user) {
      res.render("profile.ejs", { userInfo: user });
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
