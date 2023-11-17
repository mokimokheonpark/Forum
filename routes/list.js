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
    let dataCount = await db.collection("post").countDocuments();
    let pageCount = Math.ceil(dataCount / 10);
    let skippedDataCount = (req.params.id - 1) * 10;
    let data = await db
      .collection("post")
      .find()
      .skip(skippedDataCount)
      .limit(10)
      .toArray();
    res.render("list.ejs", {
      posts: data,
      pages: pageCount,
      user: req.user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
