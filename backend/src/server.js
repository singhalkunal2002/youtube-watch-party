const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const setupSocketHandlers = require("./socket/socketHandler");

const app = express();

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

setupSocketHandlers(io);

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
