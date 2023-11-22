const router = require("express").Router();

const connectDB = require("../database");
let db;
connectDB
  .then((client) => {
    db = client.db("Forum");
  })
  .catch((err) => {
    console.log(err);
  });

router.get("/:id", async (req, res) => {
  try {
    if (req.user) {
      let myDataCount = await db
        .collection("comment")
        .countDocuments({ userId: req.user._id });
      let pageCount = Math.ceil(myDataCount / 10);
      let skippedDataCount = (req.params.id - 1) * 10;
      let data = await db
        .collection("comment")
        .find({ userId: req.user._id })
        .skip(skippedDataCount)
        .limit(10)
        .toArray();
      res.render("myComment.ejs", {
        comments: data,
        pages: pageCount,
        user: req.user,
      });
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
