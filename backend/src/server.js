const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = require("./app");
const socketHandler = require("./socket/socketHandler");
const connectDB = require("./config/db"); // <--- DB Import

const PORT = process.env.PORT || 5000;

// Database Connection
connectDB(); // <--- Connect Call

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Socket.IO handlers
socketHandler(io);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});