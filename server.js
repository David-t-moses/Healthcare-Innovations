const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// Force development mode
process.env.NODE_ENV = dev ? "development" : "production";

const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Initialize global io
global.io = null;

nextApp
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      nextHandler(req, res);
    });

    // Initialize Socket.IO with proper configuration
    const io = new Server(server, {
      cors: {
        origin: dev ? "http://localhost:3000" : process.env.NEXT_PUBLIC_APP_URL,
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Store io instance globally
    global.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // Handle user room joining
      socket.on("join-user-room", (userId) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    server.listen(port, () => {
      console.log(`> Server running on http://localhost:${port}`);
      console.log("Socket.IO initialized successfully!");
    });
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
