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
      res.status(400).send("Not Found");
    } else {
      res.render("edit.ejs", { data: data });
    }
  } catch (e) {
    console.log(e);
    res.status(404).send("Not Found");
  }
});

router.put("/put", async (req, res) => {
  try {
    if (req.body.id === "") {
      res.send("Invalid post id");
    } else if (req.body.title === "") {
      res.send("Please write the title");
    } else if (req.body.content === "") {
      res.send("Please write the content");
    } else {
      let id = req.body.id;
      await db
        .collection("post")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { title: req.body.title, content: req.body.content } }
        );
      res.redirect("/list/1");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;