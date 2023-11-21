const express = require("express");
const app = express();
const methodOverride = require("method-override");

const { createServer } = require("http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

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
    server.listen(process.env.PORT, () => {
      console.log(`Forum app listening on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
app.use(passport.initialize());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      dbName: "Forum",
    }),
  })
);
app.use(passport.session());

app.use("/", require("./routes/home"));
app.use("/chat", require("./routes/chat"));
app.use("/comment", require("./routes/comment"));
app.use("/delete", require("./routes/delete"));
app.use("/detail", require("./routes/detail"));
app.use("/edit", require("./routes/edit"));
app.use("/list", require("./routes/list"));
app.use("/login", require("./routes/login"));
app.use("/logout", require("./routes/logout"));
app.use("/mylist", require("./routes/mylist"));
app.use("/profile", require("./routes/profile"));
app.use("/search", require("./routes/search"));
app.use("/signup", require("./routes/signup"));
app.use("/write", require("./routes/write"));

io.on("connection", (socket) => {
  socket.on("ask-to-join", (data) => {
    socket.join(data);
  });

  socket.on("send-message", (data) => {
    io.to(data.room).emit("show-message", data.msg);
  });
});
