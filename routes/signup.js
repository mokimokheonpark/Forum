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

const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  res.render("signup.ejs");
});

router.post("/", async (req, res) => {
  let hash = await bcrypt.hash(req.body.password, 10);
  await db
    .collection("user")
    .insertOne({ username: req.body.username, password: hash });
  res.redirect("/login");
});

module.exports = router;
