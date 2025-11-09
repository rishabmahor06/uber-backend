const http = require("http");
const app = require("./app");
const { initializeSocket } = require("./socket");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Create Socket.IO server with CORS settings
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  path: "/socket.io", // Remove trailing slash
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  connectTimeout: 45000,
  allowUpgrades: true,
  maxHttpBufferSize: 1e8,
  allowEIO3: true,
  allowEIO4: true,
});

// Debug WebSocket connection issues
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

// Initialize socket with the io instance
initializeSocket(io);

// Health check endpoint for WebSocket
app.get("/api/socket/health", (req, res) => {
  res.status(200).send({
    status: "ok",
    connections: io.engine.clientsCount,
    uptime: process.uptime(),
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `WebSocket server available at ws://localhost:${PORT}/api/socket/io`
  );
});

// module.exports = server;
