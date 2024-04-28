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

const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY_ID,
  },
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "moki1forum",
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

router.get("/", (req, res) => {
  try {
    res.render("write.ejs", { user: req.user });
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/post", upload.single("img1"), async (req, res) => {
  if (req.body.title === "" || req.body.content === "") {
    res.redirect("/write");
  } else {
    try {
      if (req.file) {
        await db.collection("post").insertOne({
          title: req.body.title,
          content: req.body.content,
          img: req.file.location,
          user: req.user._id,
          username: req.user.username,
        });
      } else {
        await db.collection("post").insertOne({
          title: req.body.title,
          content: req.body.content,
          user: req.user._id,
          username: req.user.username,
        });
      }
      let dataCount = await db.collection("post").countDocuments();
      let lastPage = Math.ceil(dataCount / 10);
      res.redirect("/list/" + lastPage);
    } catch (e) {
      console.log(e);
      res.status(500).send("Internal Server Error");
    }
  }
});

module.exports = router;
