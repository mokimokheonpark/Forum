const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
require("dotenv").config();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: process.env.COOKIE_MAX_AGE },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      dbName: "Forum",
    }),
  })
);

app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      let data = await db.collection("user").findOne({ username: username });
      if (!data) {
        return cb(null, false, { message: "wrong username" });
      }
      if (await bcrypt.compare(password, data.password)) {
        return cb(null, data);
      } else {
        return cb(null, false, { message: "wrong password" });
      }
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal Server Error");
    }
  })
);

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username });
  });
});

passport.deserializeUser(async (user, done) => {
  let data = await db
    .collection("user")
    .findOne({ _id: new ObjectId(user.id) });
  delete data.password;
  process.nextTick(() => {
    return done(null, data);
  });
});

const { MongoClient, ObjectId } = require("mongodb");

let db;
new MongoClient(process.env.MONGODB_URL)
  .connect()
  .then((client) => {
    console.log("Successfully connected to the DB");
    db = client.db("Forum");
    app.listen(process.env.PORT, () => {
      console.log(`Forum app listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/list", async (req, res) => {
  try {
    let data = await db.collection("post").find().toArray();
    res.render("list.ejs", { posts: data });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/write", (req, res) => {
  res.render("write.ejs");
});

app.post("/write-post", async (req, res) => {
  try {
    if (req.body.title === "") {
      res.send("Please write the title");
    } else if (req.body.content === "") {
      res.send("Please write the content");
    } else {
      await db
        .collection("post")
        .insertOne({ title: req.body.title, content: req.body.content });
      res.redirect("/list");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/detail/:id", async (req, res) => {
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

app.get("/edit/:id", async (req, res) => {
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

app.put("/edit-put", async (req, res) => {
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
      res.redirect("/list");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/delete", async (req, res) => {
  let id = req.query.id;
  await db.collection("post").deleteOne({ _id: new ObjectId(id) });
  res.send("Successfully deleted");
});

app.get("/list/:id", async (req, res) => {
  try {
    let dataCount = await db.collection("post").countDocuments();
    let pageCount = Math.ceil(dataCount / 5);
    let skippedDataCount = (req.params.id - 1) * 5;
    let data = await db
      .collection("post")
      .find()
      .skip(skippedDataCount)
      .limit(5)
      .toArray();
    res.render("list.ejs", { posts: data, pages: pageCount });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.post("/login", async (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      return res.status(500).json(error);
    }
    if (!user) {
      return res.status(401).json(info.message);
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", async (req, res) => {
  let hash = await bcrypt.hash(req.body.password, 10);
  await db
    .collection("user")
    .insertOne({ username: req.body.username, password: hash });
  res.redirect("/");
});
