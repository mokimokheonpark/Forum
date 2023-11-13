const router = require("express").Router();

router.get("/", (req, res) => {
  try {
    req.logOut(() => {
      req.session.destroy();
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
