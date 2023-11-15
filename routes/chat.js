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
  await db.collection("chatroom").insertOne({
    participants: [req.user._id, new ObjectId(req.query.postUser)],
    date: new Date(),
  });
  res.redirect("/chat/list");
});

router.get("/list", async (req, res) => {
  let data = await db
    .collection("chatroom")
    .find({ participants: req.user._id })
    .toArray();
  res.render("chatList.ejs", { chatList: data, user: req.user });
});

router.get("/detail/:id", async (req, res) => {
  let data = await db
    .collection("chatroom")
    .findOne({ _id: new ObjectId(req.params.id) });
  res.render("chatDetail.ejs", { chatDetail: data, user: req.user });
});

module.exports = router;
