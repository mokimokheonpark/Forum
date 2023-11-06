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
    let id = req.params.id;
    let data = await db.collection("post").findOne({ _id: new ObjectId(id) });
    if (data === null) {
      res.status(404).send("Not Found");
    } else {
      res.render("detail.ejs", { data: data });
    }
  } catch (e) {
    console.log(e);
    res.status(404).send("Not Found");
  }
});

module.exports = router;
