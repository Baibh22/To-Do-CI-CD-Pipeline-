const { randomUUID } = require("node:crypto");
const logger = require("../lib/logger");

function requestLogger(req, res, next) {
  const reqId = req.headers["x-request-id"] ? String(req.headers["x-request-id"]) : randomUUID();
  req.id = reqId;
  res.setHeader("x-request-id", reqId);

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    logger.info("request", {
      reqId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 1000) / 1000,
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
  });

  next();
}

module.exports = { requestLogger };

