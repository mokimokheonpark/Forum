const express = require("express");
const app = express();
const methodOverride = require("method-override");

require("dotenv").config();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const connectDB = require("./database");
let db;
connectDB
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

app.use("/", require("./routes/home"));
app.use("/list", require("./routes/list"));
app.use("/detail", require("./routes/detail"));
app.use("/signup", require("./routes/signup"));
app.use("/login", require("./routes/login"));
app.use("/profile", require("./routes/profile"));
app.use("/write", require("./routes/write"));
app.use("/edit", require("./routes/edit"));
app.use("/delete", require("./routes/delete"));
