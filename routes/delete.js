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

router.delete("/", async (req, res) => {
  await db.collection("post").deleteOne({
    _id: new ObjectId(req.query.id),
    user: new ObjectId(req.user._id),
  });
  await db.collection("comment").deleteMany({
    parentId: new ObjectId(req.query.id),
  });
  res.send("Successfully deleted");
});

module.exports = router;
