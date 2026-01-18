const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [kind, token] = header.split(" ");
    if (kind !== "Bearer" || !token) {
      return res.status(401).json({ message: "missing token" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "server misconfigured" });
    }

    const payload = jwt.verify(token, secret);
    req.userId = String(payload?.sub || "");
    if (!req.userId) {
      return res.status(401).json({ message: "invalid token" });
    }

    return next();
  } catch (_err) {
    return res.status(401).json({ message: "invalid token" });
  }
}

module.exports = { requireAuth };

