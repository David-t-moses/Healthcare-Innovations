const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";

const nextApp = next({ dev });
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
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
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
