const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeEmail, normalizeName, validatePassword, validateTodoTitle } = require("../src/lib/validators");

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  A@B.COM "), "a@b.com");
});

test("normalizeName returns undefined for empty string", () => {
  assert.equal(normalizeName("   "), undefined);
  assert.equal(normalizeName(null), undefined);
});

test("validatePassword enforces minimum length", () => {
  assert.deepEqual(validatePassword("12345"), { ok: false, message: "password must be at least 6 characters" });
  assert.deepEqual(validatePassword("123456"), { ok: true });
});

test("validateTodoTitle trims and validates", () => {
  assert.deepEqual(validateTodoTitle(""), { ok: false, message: "title is required" });
  assert.deepEqual(validateTodoTitle("  hello  "), { ok: true, value: "hello" });
});

