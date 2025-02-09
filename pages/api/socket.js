import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  // Check if Socket.IO server is already initialized
  if (res.socket.server.io) {
    console.log("Socket.IO server already running");
    res.end();
    return;
  }

  console.log("Initializing Socket.IO server");
  // Create a new Socket.IO server and attach it to the HTTP server
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  // Listen for client connections
  io.on('connection', (socket) => {
    console.log("Client connected: " + socket.id);
    // Additional socket event handlers can be added here
  });

  res.end();
} 