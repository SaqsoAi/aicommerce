import { Server } from "socket.io";

export const initSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    // 🧠 JOIN ROOM (optional for orders/chat)
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
    });

    // 🛒 REALTIME ORDER UPDATE
    socket.on("order_created", (data) => {
      io.emit("order_update", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
    });
  });

  return io;
};