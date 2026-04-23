const app = require("./app");
const http = require("http");
const { initRealtime } = require("./src/realtime");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initRealtime(server);

server.listen(PORT, () => {
  console.log(`Supermarket API running on port ${PORT}`);
});
