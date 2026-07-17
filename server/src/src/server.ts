import http from "http";
import app from "./app";
import { initSocket } from "./socket";

const server = http.createServer(app);

// 🚀 INIT SOCKET.IO
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});