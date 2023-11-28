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

const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

router.use(passport.initialize());
router.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      dbName: "Forum",
    }),
  })
);
router.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, cb) => {
    try {
      let data = await db.collection("user").findOne({ username: username });
      if (!data) {
        return cb(null, false, {
          message:
            "You entered wrong username. Please click the back button and enter a correct username.",
        });
      }
      if (await bcrypt.compare(password, data.password)) {
        return cb(null, data);
      } else {
        return cb(null, false, {
          message:
            "You entered wrong password. Please click the back button and enter a correct password.",
        });
      }
    } catch (e) {
      console.log(e);
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

router.get("/", async (req, res) => {
  try {
    res.render("login.ejs", { user: req.user });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res, next) => {
  if (req.body.usernmae === "" || req.body.password === "") {
    res.redirect("/login");
  } else {
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
  }
});

module.exports = router;
