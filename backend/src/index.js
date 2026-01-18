require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { connectToDatabase } = require("./db");
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");
const { requestLogger } = require("./middleware/requestLogger");
const logger = require("./lib/logger");

const PORT = Number(process.env.PORT) || 5000;

function createCorsOptions() {
  const raw = String(process.env.CORS_ORIGIN || "").trim();
  const allowList = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : null;

  const allowLocalRegexes = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowList) return callback(null, allowList.includes(origin));
      return callback(null, allowLocalRegexes.some((r) => r.test(origin)));
    },
    credentials: true,
  };
}

async function main() {
  await connectToDatabase();

  const app = express();

  app.use(cors(createCorsOptions()));
  app.use(requestLogger);
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const readyState = mongoose.connection.readyState;
    const dbState =
      readyState === 1 ? "connected" : readyState === 2 ? "connecting" : readyState === 0 ? "disconnected" : "disconnecting";
    res.json({
      ok: true,
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      db: { state: dbState, readyState },
    });
  });
  app.get("/api/health", (req, res) => res.redirect(307, "/health"));
  app.use("/api/auth", authRoutes);
  app.use("/api/todos", todoRoutes);

  app.use((err, req, res, _next) => {
    logger.error("unhandled_error", {
      reqId: req?.id,
      method: req?.method,
      path: req?.originalUrl,
      message: err?.message,
      stack: err?.stack,
    });
    res.status(500).json({ message: "server error" });
  });

  app.listen(PORT, () => {
    logger.info("server_listening", { port: PORT });
  });
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
