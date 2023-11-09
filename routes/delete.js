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
  let id = req.query.id;
  await db.collection("post").deleteOne({ _id: new ObjectId(id) });
  res.send("Successfully deleted");
});

module.exports = router;
