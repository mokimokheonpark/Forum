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

router.post("/", async (req, res) => {
  let data = await db.collection("comment").insertOne({
    userId: new ObjectId(req.user._id),
    username: req.user.username,
    content: req.body.content,
    parentId: new ObjectId(req.body.parentId),
  });
  res.redirect("back");
});

module.exports = router;
