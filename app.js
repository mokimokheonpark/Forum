const express = require("express");
const app = express();
const port = 3000;
const methodOverride = require("method-override");

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const { MongoClient, ObjectId } = require("mongodb");

let db;
const url =
  "mongodb+srv://mokimokheonpark:moki123@cluster0.f8wvtex.mongodb.net/?retryWrites=true&w=majority";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("Successfully connected to the DB");
    db = client.db("Forum");
    app.listen(port, () => {
      console.log(`Forum app listening on port ${port}`);
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
