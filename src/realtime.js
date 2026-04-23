const WebSocket = require("ws");
const { WebSocketServer } = WebSocket;

let wssInstance = null;

const initRealtime = (server) => {
  wssInstance = new WebSocketServer({ noServer: true });
  server.on("upgrade", (request, socket, head) => {
    const rawUrl = String(request.url || "");
    const pathname = rawUrl.split("?")[0];
    if (pathname !== "/ws" && pathname !== "/api/ws") {
      socket.destroy();
      return;
    }
    wssInstance.handleUpgrade(request, socket, head, (client) => {
      wssInstance.emit("connection", client, request);
    });
  });
  wssInstance.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected", ts: Date.now() }));
  });
  return wssInstance;
};

const broadcastRealtime = (payload) => {
  if (!wssInstance) return;
  const msg = JSON.stringify({ ...payload, ts: Date.now() });
  wssInstance.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
};

module.exports = { initRealtime, broadcastRealtime };
