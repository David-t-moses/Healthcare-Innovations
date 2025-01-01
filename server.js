const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Add this to make io globally available
global.io = null;

nextApp
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      nextHandler(req, res);
    });

    // Initialize Socket.IO and store it globally
    const io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
      transports: ["websocket", "polling"],
    });

    // Store io instance globally
    global.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`> Server running on port ${port}`);
      console.log("Socket.IO initialized successfully!");
    });
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
