const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Working ✅");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});