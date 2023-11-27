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

router.get("/", async (req, res) => {
  try {
    if (req.user) {
      let postCount = await db
        .collection("post")
        .countDocuments({ user: req.user._id });
      let commentCount = await db
        .collection("comment")
        .countDocuments({ userId: req.user._id });
      let chatRoomCount = await db
        .collection("chatroom")
        .countDocuments({ users: req.user._id });
      res.render("profile.ejs", {
        user: req.user,
        postCount: postCount,
        commentCount: commentCount,
        chatRoomCount: chatRoomCount,
      });
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
