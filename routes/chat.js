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

router.get("/request", async (req, res) => {
  try {
    await db.collection("chatroom").insertOne({
      participants: [req.user._id, new ObjectId(req.query.postUser)],
      date: new Date(),
    });
    res.redirect("/chat/list");
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/list", async (req, res) => {
  try {
    let data = await db
      .collection("chatroom")
      .find({ participants: req.user._id })
      .toArray();
    res.render("chatList.ejs", { chatList: data, user: req.user });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    let data = await db
      .collection("chatroom")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (
      req.user._id.toString() === data.participants[0].toString() ||
      req.user._id.toString() === data.participants[1].toString()
    ) {
      res.render("chatDetail.ejs", { chatDetail: data, user: req.user });
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
