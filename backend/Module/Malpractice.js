const mongoose = require("mongoose");

const MalpracticeSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  malpractice: {
    type: String,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

const Malpractice = mongoose.model("Malpractice", MalpracticeSchema);

module.exports = Malpractice;
