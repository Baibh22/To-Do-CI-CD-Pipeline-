const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/User");
const { normalizeEmail, normalizeName, validatePassword } = require("../lib/validators");

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required");
  }
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    const pw = validatePassword(password);
    if (!pw.ok) return res.status(400).json({ message: pw.message });

    const normalizedEmail = normalizeEmail(email);

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ message: "email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: normalizeName(name),
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      user: { id: user._id.toString(), name: user.name ?? "", email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = signToken(user._id.toString());
    return res.json({
      token,
      user: { id: user._id.toString(), name: user.name ?? "", email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
