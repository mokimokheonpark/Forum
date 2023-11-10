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
  res.render("write.ejs");
});

router.post("/post", upload.single("img1"), async (req, res) => {
  try {
    if (req.body.title === "") {
      res.send("Please write the title");
    } else if (req.body.content === "") {
      res.send("Please write the content");
    } else if (req.file) {
      await db.collection("post").insertOne({
        title: req.body.title,
        content: req.body.content,
        img: req.file.location,
      });
      res.redirect("/list/1");
    } else {
      await db.collection("post").insertOne({
        title: req.body.title,
        content: req.body.content,
      });
      res.redirect("/list/1");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;