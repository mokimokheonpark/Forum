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
      let myData = await db
        .collection("post")
        .find({ user: req.user._id })
        .toArray();
      let myDataCount = myData.length;
      let pageCount = Math.ceil(myDataCount / 10);
      let skippedDataCount = (req.params.id - 1) * 10;
      let data = await db
        .collection("post")
        .find({ user: req.user._id })
        .skip(skippedDataCount)
        .limit(10)
        .toArray();
      res.render("myList.ejs", {
        posts: data,
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
