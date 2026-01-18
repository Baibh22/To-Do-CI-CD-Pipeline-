function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function normalizeName(name) {
  const v = String(name || "").trim();
  return v ? v : undefined;
}

function validatePassword(password) {
  if (typeof password !== "string") return { ok: false, message: "password must be a string" };
  if (password.length < 6) return { ok: false, message: "password must be at least 6 characters" };
  return { ok: true };
}

function validateTodoTitle(title) {
  const v = String(title || "").trim();
  if (!v) return { ok: false, message: "title is required" };
  return { ok: true, value: v };
}

module.exports = { normalizeEmail, normalizeName, validatePassword, validateTodoTitle };

