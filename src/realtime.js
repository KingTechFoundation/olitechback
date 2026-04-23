const WebSocket = require("ws");

let wssInstance = null;

const initRealtime = (server) => {
  wssInstance = new WebSocket.Server({ server, path: "/ws" });
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
