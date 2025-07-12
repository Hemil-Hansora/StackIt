import "dotenv/config";
import http from "http";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { initializeWebSocket } from "./socket/index.js";

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = initializeWebSocket(server);

connectDB()
  .then(() => {
    // Start the server (both HTTP and WebSocket)
    server.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
      console.log(`🔌 WebSocket server initialized`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Export server and io for use in other files if needed
export { server, io };