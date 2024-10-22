const mongoose = require("mongoose");

const testSubmissionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  name: { type: String, required: true },
  type: Map,
  of: mongoose.Schema.Types.Mixed,
  email: { type: String, required: true },
  questions: [
    {
      _id: String,
      questionText: String,
      options: [String],
      correctAnswers: [Number],
    },
  ],
  answers: [
    {
      questionId: String,
      questionText: String,
      selectedAnswer: [Number],
    },
  ],
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  malpractice: { type: String, default: "false" },
});

module.exports = mongoose.model("TestSubmission", testSubmissionSchema);
