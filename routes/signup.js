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
  res.render("signup.ejs", { user: req.user });
});

router.post("/", async (req, res) => {
  let users = await db
    .collection("user")
    .findOne({ username: req.body.username });
  if (req.body.usernmae === "" || req.body.password === "") {
    res.redirect("/signup");
  } else if (users) {
    res.send(
      "The username is already in use. Please click the back button and enter a different username."
    );
  } else if (req.body.username.length < 4 || req.body.username.length > 16) {
    res.send(
      "Username must contain 4-16 characters. Please click the back button and enter a valid usename."
    );
  } else if (req.body.password.length < 8 || req.body.password.length > 16) {
    res.send(
      "Password must contain 8-16 characters. Please click the back button and enter a valid password."
    );
  } else if (req.body.password !== req.body.passwordcheck) {
    res.send(
      "Passwords do not match. Please click the back button and check them."
    );
  } else {
    let hash = await bcrypt.hash(req.body.password, 10);
    await db
      .collection("user")
      .insertOne({ username: req.body.username, password: hash });
    res.redirect("/login");
  }
});

module.exports = router;
