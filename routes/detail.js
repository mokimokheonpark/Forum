const router = require("express").Router();

const { ObjectId } = require("mongodb");
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
    let postData = await db
      .collection("post")
      .findOne({ _id: new ObjectId(req.params.id) });
    let commentData = await db
      .collection("comment")
      .find({ parentId: new ObjectId(req.params.id) })
      .toArray();
    if (postData === null || commentData === null) {
      res.status(404).send("Not Found");
    } else {
      res.render("detail.ejs", {
        postData: postData,
        commentData: commentData,
        user: req.user,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(404).send("Not Found");
  }
});

module.exports = router;
