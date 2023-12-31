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
    if (req.query.val === "") {
      res.redirect("list/1");
    } else {
      let searchCondition = [
        {
          $search: {
            index: "title_index",
            text: { query: req.query.val, path: "title" },
          },
        },
      ];
      let data = await db
        .collection("post")
        .aggregate(searchCondition)
        .toArray();
      res.render("search.ejs", { posts: data, user: req.user });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
