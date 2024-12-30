import { createServer } from "http";
import next from "next";
import { initSocket } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Initialize Socket.IO immediately
  initSocket(server);

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
