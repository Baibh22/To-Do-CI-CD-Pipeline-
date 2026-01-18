const express = require("express");

const { requireAuth } = require("../middleware/auth");
const { Todo } = require("../models/Todo");
const { validateTodoTitle } = require("../lib/validators");

const router = express.Router();

router.use(requireAuth);

async function getNextOrder(userId, status) {
  const last = await Todo.findOne({ userId, status }).sort({ order: -1 }).select({ order: 1 }).lean();
  const lastOrder = typeof last?.order === "number" ? last.order : 0;
  return lastOrder + 1000;
}

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.userId }).sort({ status: 1, order: 1, createdAt: 1 });
    return res.json({
      todos: todos.map((t) => ({
        id: t._id.toString(),
        title: t.title,
        status: t.status,
        order: t.order,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    });
  } catch (_err) {
    return res.status(500).json({ message: "server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title } = req.body ?? {};
    const v = validateTodoTitle(title);
    if (!v.ok) return res.status(400).json({ message: v.message });

    const order = await getNextOrder(req.userId, "todo");
    const todo = await Todo.create({
      userId: req.userId,
      title: v.value,
      status: "todo",
      order,
    });

    return res.status(201).json({
      todo: {
        id: todo._id.toString(),
        title: todo.title,
        status: todo.status,
        order: todo.order,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      },
    });
  } catch (_err) {
    return res.status(500).json({ message: "server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, order } = req.body ?? {};

    const todo = await Todo.findOne({ _id: id, userId: req.userId });
    if (!todo) return res.status(404).json({ message: "not found" });

    if (typeof title === "string") {
      const v = validateTodoTitle(title);
      if (!v.ok) return res.status(400).json({ message: "title cannot be empty" });
      todo.title = v.value;
    }

    if (typeof status === "string") {
      if (!["todo", "in_progress", "done"].includes(status)) {
        return res.status(400).json({ message: "invalid status" });
      }
      todo.status = status;
    }

    if (typeof order === "number" && Number.isFinite(order)) {
      todo.order = order;
    } else if (typeof status === "string") {
      todo.order = await getNextOrder(req.userId, todo.status);
    }

    await todo.save();

    return res.json({
      todo: {
        id: todo._id.toString(),
        title: todo.title,
        status: todo.status,
        order: todo.order,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      },
    });
  } catch (_err) {
    return res.status(500).json({ message: "server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.userId }).lean();
    if (!deleted) return res.status(404).json({ message: "not found" });
    return res.json({ ok: true });
  } catch (_err) {
    return res.status(500).json({ message: "server error" });
  }
});

module.exports = router;
