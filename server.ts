import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

// Enable garbage collection
if (global.gc) {
  global.gc();
}

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

// Optimize Next.js for production
const nextApp = next({
  dev,
  conf: {
    compress: true,
    poweredByHeader: false,
  },
});
const nextHandler = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      nextHandler(req, res);
    });

    const io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 5000,
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        socket.removeAllListeners();
      });
    });

    server.listen(port, () => {
      console.log(`> Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
