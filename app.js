const express = require("express");
const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
  console.log(`Forum app listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
