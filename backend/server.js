require("dotenv").config();
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const app = require("./src/app");
const { connectDB } = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  const parameters = url.parse(req.url, true).query;
  const userId = parameters.userId;
  if (userId) {
    ws.userId = userId.toString();
    console.log(`🔌 WebSocket connected for user: ${userId}`);
  }

  ws.on("close", () => {
    if (userId) {
      console.log(`🔌 WebSocket disconnected for user: ${userId}`);
    }
  });
});

// Attach wss to app to access in controllers via req.app.get('wss')
app.set("wss", wss);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
