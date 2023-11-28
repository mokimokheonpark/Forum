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
    if (req.user) {
      let data = await db.collection("chatroom").findOne({
        users: [req.user._id, new ObjectId(req.query.postDataUser)],
      });
      if (data) {
        res.redirect(`/chat/detail/${data._id}`);
      } else {
        await db.collection("chatroom").insertOne({
          users: [req.user._id, new ObjectId(req.query.postDataUser)],
          usernames: [req.user.username, req.query.postDataUsername],
          date: new Date(),
        });
        res.redirect("/chat/list");
      }
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/list", async (req, res) => {
  try {
    if (req.user) {
      let data = await db
        .collection("chatroom")
        .find({ users: req.user._id })
        .toArray();
      res.render("chatList.ejs", { chatList: data, user: req.user });
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/detail/:id", async (req, res) => {
  try {
    let chatRoomData = await db
      .collection("chatroom")
      .findOne({ _id: new ObjectId(req.params.id) });
    let messageData = await db
      .collection("message")
      .find({ room: new ObjectId(req.params.id) })
      .toArray();
    if (
      req.user &&
      (req.user._id.toString() === chatRoomData.users[0].toString() ||
        req.user._id.toString() === chatRoomData.users[1].toString())
    ) {
      res.render("chatDetail.ejs", {
        chatRoomData: chatRoomData,
        messageData: messageData,
        user: req.user,
      });
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
