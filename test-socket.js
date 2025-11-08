const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  path: "/api/socket/io",
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to socket server!");
  console.log("Socket ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

// Keep the script running
setInterval(() => {
  if (socket.connected) {
    console.log("Socket is still connected");
  }
}, 5000);
