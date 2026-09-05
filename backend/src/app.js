const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/rooms", require("./routes/roomRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Watch Party Server is running",
  });
});

module.exports = app;