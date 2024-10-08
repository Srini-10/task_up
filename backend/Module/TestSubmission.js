const mongoose = require("mongoose");

const testSubmissionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  registerNumber: { type: String, required: true },
  type: Map,
  of: mongoose.Schema.Types.Mixed,
  questions: [
    {
      _id: String,
      questionText: String,
      options: [String],
      answers: [String],
    },
  ],
  answers: [
    {
      questionId: String,
      questionText: String,
      selectedAnswer: [String],
    },
  ],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  malpractice: { type: String, default: "false" },
});

module.exports = mongoose.model("TestSubmission", testSubmissionSchema);
