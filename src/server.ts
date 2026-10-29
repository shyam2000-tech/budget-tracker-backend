import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Daily Budget Tracker Backend listening on port ${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    });

    const gracefulShutdown = (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Closing server gracefully...`);
      server.close(() => {
        console.log("[Server] HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("[Server] Fatal error during startup:", error);
    process.exit(1);
  }
};

startServer();

