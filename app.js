const express = require("express");
const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));

const { MongoClient } = require("mongodb");

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
  let data = await db.collection("post").find().toArray();
  console.log(data);
  console.log(data[0]);
  console.log(data[0].title);
  console.log(data[0].content);
  res.send(data[0].content);
});
