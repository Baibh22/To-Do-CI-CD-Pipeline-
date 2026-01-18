const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in_progress", "done"],
      index: true,
    },
    order: { type: Number, required: true, index: true },
  },
  { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = { Todo };

