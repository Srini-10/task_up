const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const TestSubmission = require("./Module/TestSubmission.js");
const CreateCandidate = require("./Module/CreateCandidate.js");
const cloudinary = require("./Module/cloudinaryConfig.js");
const app = express();
require("dotenv").config();
const allowedOrigins = [
  "https://taskup-brix.vercel.app", // Deployed frontend
  "http://localhost:3000", // Local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// mongoose
//   .connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error("MongoDB connection error:", err));

const mongoURI = "mongodb://localhost:27017/sassDB";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Uploading file to:", "uploads/"); // Log this
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueFilename = Date.now() + path.extname(file.originalname);
    console.log("Saving file as:", uniqueFilename); // Log this
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage: storage });

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  inputType: { type: String, required: true },
  options: { type: [String], default: [] },
  correctAnswers: { type: [Number], required: true },
  required: { type: Boolean, default: false },
  sector: { type: String, required: false },
});

// Define the schema for tests
const TestSchema = new mongoose.Schema({
  testName: String,
  startDate: Date,
  endDate: Date,
  authOption: String,
  password: String,
  questions: [QuestionSchema],
  candidates: [
    {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      registerNumber: { type: String, required: true },
      dob: { type: String, required: true },
    },
  ],
  submissions: [
    {
      registerNumber: String,
      marks: Number,
      submissionTime: { type: Date, default: Date.now },
      malpractice: { type: String, default: "false" },
    },
  ],
});

const Test = mongoose.model("Test", TestSchema);

// Route for handling profile picture upload
app.post(
  "/uploadProfilePicture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).send("No file uploaded.");
      }

      const result = await cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" }, // Optional: specify a folder in Cloudinary
        (error, result) => {
          if (error) {
            return res.status(500).send("Error uploading to Cloudinary");
          }

          // Send the Cloudinary URL back
          res.status(200).send({ url: result.secure_url });
        }
      );

      file.stream.pipe(result); // Upload file to Cloudinary
    } catch (error) {
      res.status(500).send("Error uploading image");
    }
  }
);

// POST route to register a new candidate
app.post(
  "/api/testCandidates",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { registerNumber, dob, email, phone } = req.body;
      const profilePicture = req.file ? req.file.filename : null;

      // Check if register number exists
      const existingCandidate = await CreateCandidate.findOne({
        registerNumber,
      });

      if (existingCandidate) {
        return res
          .status(400)
          .json({ message: "Register number already exists" });
      }

      // Save the candidate data to MongoDB
      const newCandidate = new CreateCandidate({
        registerNumber,
        dob,
        email,
        phone,
        profilePicture, // Save the file name in the database
      });

      await newCandidate.save();
      res.status(201).json({ message: "candidate registered successfully!" });
    } catch (error) {
      console.error("Error registering candidate:", error);
      res.status(500).json({ message: "Error registering candidate." });
    }
  }
);

app.post("/api/importCandidates", async (req, res) => {
  try {
    const { candidates } = req.body; // Array of candidate data

    // Validate the data format before proceeding
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ message: "Invalid candidates data." });
    }

    // Check for existing candidates based on registerNumber, email, or phone
    const existingCandidates = await CreateCandidate.find({
      $or: [
        {
          registerNumber: {
            $in: candidates.map((candidate) => candidate.registerNumber),
          },
        },
        { email: { $in: candidates.map((candidate) => candidate.email) } },
        { phone: { $in: candidates.map((candidate) => candidate.phone) } },
      ],
    });

    // Log existing candidates for debugging
    console.log("Existing Candidates:", existingCandidates);

    // Prepare data for bulk insert or update
    const bulkOps = [];

    // Create a map to track duplicates within the input data itself
    const candidateMap = new Map();

    candidates.forEach((candidate) => {
      // Normalize the key based on unique identifiers (registerNumber, email, phone)
      const key = `${candidate.registerNumber}-${candidate.email}-${candidate.phone}`;

      // Store the latest occurrence of the candidate (in case of duplicates)
      candidateMap.set(key, candidate);
    });

    // Loop over the candidateMap values (which are the last versions of candidates with the same keys)
    candidateMap.forEach((candidate) => {
      const existingCandidate = existingCandidates.find(
        (existing) =>
          existing.registerNumber === candidate.registerNumber ||
          existing.email === candidate.email ||
          existing.phone === candidate.phone
      );

      bulkOps.push({
        updateOne: {
          filter: {
            $or: [
              { registerNumber: candidate.registerNumber },
              { email: candidate.email },
              { phone: candidate.phone },
            ],
          },
          update: {
            $set: {
              registerNumber: candidate.registerNumber,
              dob: candidate.dob,
              email: candidate.email,
              phone: candidate.phone,
              profilePicture: candidate.profilePicture || null, // Handle profile picture
            },
          },
          upsert: true, // Insert if not found, otherwise update
        },
      });
    });

    // Perform bulk insert or update
    if (bulkOps.length > 0) {
      const result = await CreateCandidate.bulkWrite(bulkOps);

      // Log the result for debugging
      console.log("Bulk Write Result:", result);

      // Respond to the client with the number of upserted candidates
      res.status(200).json({
        message: `${result.upsertedCount} candidates inserted, ${result.modifiedCount} candidates updated successfully.`,
        result, // Include result in response for further debugging if needed
      });
    } else {
      res.status(400).json({ message: "No candidates to import." });
    }
  } catch (error) {
    console.error("Error importing candidates:", error);
    res.status(500).json({ message: "Error importing candidates." });
  }
});

// PUT: Update existing candidate details
app.put(
  "/api/testCandidates/:id",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { _id, registerNumber, dob, email, phone } = req.body;

      // Check if register number exists
      const existingCandidate = await CreateCandidate.findOne({
        registerNumber,
      });

      if (existingCandidate) {
        return res
          .status(400)
          .json({ message: "Register number already exists" });
      }

      const updatedFields = {
        _id,
        registerNumber,
        dob,
        email,
        phone,
      };

      // Update profile picture only if a new one is uploaded
      if (req.file) {
        updatedFields.profilePicture = req.file.filename;
      }

      // Update the candidate record in the database
      const updatedCandidate = await CreateCandidate.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true }
      );

      if (!updatedCandidate) {
        return res.status(404).send({ message: "Candidate not found" });
      }

      // Send JSON response instead of plain text
      res.status(200).json({
        message: "Candidate updated successfully",
        candidate: updatedCandidate,
      });
    } catch (error) {
      console.error("Error updating candidate: ", error);
      res.status(500).json({ message: "Error updating candidate" });
    }
  }
);

// Get all candidates
app.get("/api/testCandidates", async (req, res) => {
  try {
    const candidates = await CreateCandidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates." });
  }
});

// DELETE: Delete a candidate
app.delete("/api/testCandidates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCandidate = await CreateCandidate.findByIdAndDelete(id);

    if (!deletedCandidate) {
      return res.status(404).send("candidate not found");
    }

    res.send("candidate deleted successfully");
  } catch (error) {
    res.status(500).send("Error deleting candidate");
  }
});

// POST route to create a new test
app.post("/api/tests", async (req, res) => {
  try {
    const {
      testName,
      startDate,
      endDate,
      authOption,
      questions = [],
      candidates = [],
    } = req.body;

    // Log the received body to verify if the candidates and questions exist
    console.log("Received candidates:", candidates);
    console.log("Received questions:", questions);

    // Validate and format candidate data if it exists
    const formattedCandidates = candidates
      .filter(
        (candidate) =>
          candidate.registerNumber &&
          candidate.dob &&
          candidate.email &&
          candidate.phone
      )
      .map((candidate) => ({
        registerNumber: candidate.registerNumber,
        dob: candidate.dob,
        email: candidate.email,
        phone: candidate.phone,
      }));

    // Validate that each question has correctAnswers, or set default to an empty array
    const validatedQuestions = questions.map((q) => ({
      questionText: q.questionText,
      inputType: q.inputType,
      options: q.options,
      correctAnswers: q.correctAnswers || [],
      required: q.required || false,
      sector: q.sector,
    }));

    // Create a new test instance
    const newTest = new Test({
      testName,
      startDate,
      endDate,
      authOption,
      questions: validatedQuestions,
      candidates: formattedCandidates,
    });

    // Save the test to MongoDB
    await newTest.save();

    res.status(201).json({ message: "Test created successfully!" });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({
      message: error.message || "Server error. Unable to create test.",
    });
  }
});

app.post("/api/submit-test", async (req, res) => {
  const { answers } = req.body;
  let score = 0;

  const questions = await QuestionModel.find();

  questions.forEach((question) => {
    const correctAnswerIndex = question.correctAnswerIndex;
    const userAnswerIndex = answers[question._id];

    if (userAnswerIndex === correctAnswerIndex) {
      score += 1; // Add to score if correct
    }
  });

  res.json({ score });
});

// Get all tests
app.get("/api/tests", async (req, res) => {
  try {
    // Fetch all tests from the database
    const tests = await Test.find().populate("questions");

    // Map through the tests and structure the response
    const testsWithDetails = tests.map((test) => ({
      _id: test._id,
      testName: test.testName,
      startDate: test.startDate,
      endDate: test.endDate,
      authOption: test.authOption,
      questions: test.questions.map((q) => ({
        questionText: q.questionText,
        inputType: q.inputType,
        options: q.options,
        correctAnswers: q.correctAnswers || [],
        required: q.required,
        sector: q.sector,
      })),
      candidates: test.candidates,
      malpractice: test.malpractice,
      submissionsCount: test.submissions ? test.submissions.length : 0,
    }));

    // Send the structured tests data as a response
    res.json(testsWithDetails);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Error fetching tests" });
  }
});

// Fetch Input Types
app.get("/api/inputTypes", (req, res) => {
  const inputTypes = ["text", "radio", "checkbox", "select"];
  res.json(inputTypes);
});

app.get("/api/tests/:testId/submissions-count", async (req, res) => {
  const { testId } = req.params;

  try {
    // Count the number of submissions for this test
    const submissionsCount = await TestSubmission.countDocuments({ testId });

    res.status(200).json({ testId, submissionsCount });
  } catch (error) {
    console.error("Error fetching submissions count:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching submissions count." });
  }
});

// Get total submitted users' register numbers and total scores for a specific test
app.get("/api/tests/:testId/ranking", async (req, res) => {
  const { testId } = req.params;

  try {
    // Find all submissions related to the specific testId
    const submissions = await TestSubmission.find({ testId });

    if (!submissions || submissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No submissions found for this test." });
    }

    // Map over all submissions and include all details for the rankings
    const rankings = submissions.map((submission) => ({
      registerNumber: submission.registerNumber,
      email: submission.email,
      marks: submission.score,
      submissionTime: submission.submittedAt,
      answers: submission.answers.map((answer) => ({
        questionId: answer.questionId,
        questionText: answer.questionText,
        selectedAnswer: answer.selectedAnswer,
      })),
      questions: submission.questions.map((question) => ({
        _id: question._id,
        questionText: question.questionText,
        options: question.options,
        correctAnswers: question.correctAnswers,
      })),
      malpractice:
        submission.malpractice === "true" || submission.malpractice === true
          ? "true"
          : "false",
      score: submission.score,
    }));

    // Sort rankings by marks in descending order
    const sortedRankings = rankings.sort((a, b) => b.marks - a.marks);

    // Log expanded objects for better visibility
    console.log(JSON.stringify(sortedRankings, null, 2));

    res.json(sortedRankings);
  } catch (error) {
    console.error("Error fetching rankings:", error);
    res.status(500).json({ message: "Server error while fetching rankings." });
  }
});

app.get("/api/questions", async (req, res) => {
  const questions = await QuestionModel.find(); // Fetch from MongoDB
  res.json(questions);
});

// GET route to fetch questions for a specific test
app.get("/api/tests/:testId/questions", async (req, res) => {
  const { testId } = req.params;

  try {
    // Find the test by ID and return the questions
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test.questions); // Send the questions array to the client
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error while fetching questions" });
  }
});

// DELETE route to delete a test by its ID
app.delete("/api/tests/:testId", async (req, res) => {
  const { testId } = req.params; // Get the testId from the URL

  try {
    // Find and delete the test from the database
    const deletedTest = await Test.findByIdAndDelete(testId);

    // If the test does not exist, return a 404 error
    if (!deletedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    // If deletion is successful, return a success message
    res.json({ message: "Test deleted successfully!" });
  } catch (error) {
    // Handle any errors that occur during the deletion process
    console.error("Error deleting test:", error);
    res.status(500).json({ message: "Server error while deleting the test." });
  }
});

// Assuming you already have the necessary imports and initial setup

// PUT route to update a specific question
app.put("/api/tests/:testId/questions/:questionId", async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const { questionText, options, correctAnswers, inputType } = req.body;

    // Log the received request body to ensure correctAnswers is populated
    console.log("Received request data:", req.body);

    // Update the specific question in the test
    const updatedTest = await Test.findOneAndUpdate(
      { _id: testId, "questions._id": questionId },
      {
        $set: {
          "questions.$.questionText": questionText,
          "questions.$.options": options,
          "questions.$.correctAnswers": correctAnswers, // Ensure this is properly updated
          "questions.$.inputType": inputType,
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedTest) {
      return res.status(404).json({ message: "Test or Question not found." });
    }

    res.status(200).json({
      message: "Question updated successfully!",
      updatedTest,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      message: "Server error. Unable to update question.",
    });
  }
});

// DELETE route to delete a specific question
app.delete("/api/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  console.log(`Attempting to delete question with ID: ${questionId}`);

  // Check if the questionId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    console.log(`Invalid question ID: ${questionId}`);
    return res.status(400).json({ message: "Invalid question ID format" });
  }

  try {
    // Find the Test document that contains the question
    const test = await Test.findOne({ "questions._id": questionId });

    if (!test) {
      console.log(
        `Test document containing question ID ${questionId} not found.`
      );
      return res.status(404).json({ message: "Test document not found" });
    }

    // Log the found Test document to debug
    console.log(`Found Test document with ID: ${test._id}`);
    console.log(`Questions in Test document:`, test.questions);

    // Check if the question is present in the array
    const questionToDelete = test.questions.find(
      (question) => question._id.toString() === questionId
    );
    if (!questionToDelete) {
      console.log(
        `Question with ID ${questionId} not found in the Test document.`
      );
      return res.status(404).json({ message: "Question not found" });
    }

    // Log the question to be deleted
    console.log(`Deleting question:`, questionToDelete);

    // Remove the question from the test's questions array
    test.questions = test.questions.filter(
      (question) => question._id.toString() !== questionId
    );

    // Save the updated Test document
    await test.save();
    console.log(`Question with ID ${questionId} deleted successfully.`);
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Server error while deleting question" });
  }
});

app.post("/api/tests/:testId/authenticate-password", async (req, res) => {
  const { testName, password } = req.body;

  console.log("Received testName:", testName);
  console.log("Received password:", password);

  try {
    // Find the test by testName
    const test = await Test.findOne({ testName });
    console.log("Test found:", test);

    // Check if the test exists
    if (!test) {
      return res
        .status(404)
        .json({ success: false, message: "Test not found" });
    }

    // Directly compare the incoming password with the stored password
    const isMatch = password === test.password; // Change this line to compare plain text passwords
    console.log("Password match:", isMatch);

    // Check if the passwords match
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // Authentication successful
    res
      .status(200)
      .json({ success: true, message: "Authenticated successfully" });
  } catch (error) {
    console.error("Authentication error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during authentication" });
  }
});

app.post("/api/tests/:testId/authenticate", async (req, res) => {
  const { registerNumber, dob, email, phone } = req.body;
  const { testId } = req.params;

  try {
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    console.log("Received registerNumber:", registerNumber);
    console.log("Received dob:", dob);
    console.log("Received email:", email);
    console.log("Received phone:", phone);

    // Check if the candidate is in the test's candidate list
    const candidate = test.candidates.find(
      (candidate) =>
        (candidate.registerNumber === registerNumber &&
          candidate.dob === dob) ||
        (candidate.email === email && candidate.phone === phone)
    );

    if (!candidate) {
      return res.status(403).json({ message: "Authentication failed" });
    }

    // Authentication successful, return the test questions and candidate details
    res.status(200).json({
      questions: test.questions,
      registerNumber: candidate.registerNumber,
      email: candidate.email,
    });
  } catch (error) {
    console.error("Error authenticating candidate:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
});

// POST route to submit the test and calculate the score
app.post("/api/tests/:testId/submit", async (req, res) => {
  const { testId } = req.params;
  const { answers, registerNumber, email, questions, malpractice } = req.body;

  console.log("Incoming data:", {
    email,
    registerNumber,
    answers,
    questions,
    malpractice,
  });

  try {
    const test = await Test.findById(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    let score = 0;
    const totalQuestions = test.questions.length;

    // Calculate score based on selected answers
    test.questions.forEach((question, index) => {
      const submittedAnswer = answers.find(
        (answer) => answer.questionId === question._id.toString()
      )?.selectedAnswer;

      if (!submittedAnswer) {
        console.log(`No answer found for question ${question._id}`);
        return;
      }

      console.log(`Comparing answer for question ${question._id}`);
      console.log(`Submitted answer: ${submittedAnswer}`);
      console.log(`Correct answers: ${question.correctAnswers}`);

      // Check if the correct answer is an array or a single value
      if (Array.isArray(question.correctAnswers)) {
        // Ensure submittedAnswer is an array for comparison
        const formattedSubmittedAnswer = Array.isArray(submittedAnswer)
          ? submittedAnswer
          : [submittedAnswer]; // Convert single answer to an array

        // Increment score if any submitted answer matches any correct answer
        const anyCorrect = formattedSubmittedAnswer.some((ans) =>
          question.correctAnswers.includes(ans)
        );
        if (anyCorrect) {
          score += 1;
          console.log(`Increment score: 1 point for a correct answer match.`);
        }

        // Additional score for matching index
        formattedSubmittedAnswer.forEach((ans, idx) => {
          if (
            question.correctAnswers[idx] &&
            ans === question.correctAnswers[idx]
          ) {
            score += 1; // Increment score for correct answer at the same index
            console.log(
              `Increment score: 1 point for correct answer at the same index.`
            );
          }
        });
      } else {
        // Single value correct answer case
        console.log(`Single answer logic for question ${question._id}`);
        if (submittedAnswer === question.correctAnswers) {
          score += 1;
          console.log(`Increment score: 1 point for correct single answer.`);
        }
      }
    });

    console.log("Score calculated:", { score, totalQuestions });

    res.json({ score, totalQuestions });
  } catch (error) {
    console.error("Error submitting test:", error);
    res.status(500).json({ message: "Server error while submitting test." });
  }
});

app.post("/api/tests/:testId/save-submission", async (req, res) => {
  const { email, registerNumber, answers, score, questions, malpractice } =
    req.body; // Extract malpractice from the request body
  const { testId } = req.params;

  try {
    // Create a new TestSubmission document
    const submission = new TestSubmission({
      testId,
      email,
      registerNumber,
      answers,
      score,
      questions,
      malpractice,
      submissionTime: new Date(), // Add submissionTime to record the time of submission
    });

    await submission.save(); // Save the submission to the database

    console.log("Saved data:", {
      testId,
      email,
      registerNumber,
      answers,
      score,
      questions,
      malpractice,
      submissionTime: new Date(),
    });

    // Update the Test document with the new submission details
    await Test.findByIdAndUpdate(testId, {
      $push: {
        submissions: {
          email,
          registerNumber,
          answers,
          marks: score,
          questions,
          malpractice,
          submissionTime: new Date(), // Add submission time to the Test document
        },
      },
    });

    // Send a success response
    res
      .status(201)
      .json({ message: "Submission saved successfully", submission });
  } catch (error) {
    console.error("Error saving submission:", error);
    res
      .status(500)
      .json({ message: "Error saving submission", error: error.message });
  }
});

// Assuming you're using Express.js for the backend
app.post("/api/tests/:testId/check-submission", async (req, res) => {
  const { email, registerNumber } = req.body;
  const { testId } = req.params;

  try {
    console.log("Received testId:", testId);
    console.log("Received registerNumber:", registerNumber);
    console.log("Received email:", email);

    // Check if a submission exists for this test and registerNumber
    const submission = await TestSubmission.findOne({
      testId,
      $or: [{ email }, { registerNumber }],
    });

    console.log("Checking for submission with:", {
      testId,
      email,
      registerNumber,
    });

    if (submission) {
      // If submission exists, get total number of questions for the test
      const test = await Test.findById(testId);
      const totalQuestions = test.questions.length;

      console.log("Total questions in test:", totalQuestions);

      return res.json({
        submitted: true,
        score: submission.score,
        totalQuestions,
      });
    } else {
      // No submission exists for this registerNumber in this test
      console.log("No submission found.");
      return res.json({ submitted: false });
    }
  } catch (error) {
    console.error("Error checking submission:", error);
    res.status(500).json({ message: "Error checking submission" });
  }
});

// PUT route to update an existing test
app.put("/api/tests/:testId", async (req, res) => {
  const { testId } = req.params;
  const {
    testName,
    startDate,
    endDate,
    authOption,
    password,
    questions = [],
    candidates = [],
    malpractice,
  } = req.body;

  try {
    // Log the received questions for debugging
    console.log("Received questions data:", questions);

    // Validate and format candidate data if it exists
    const formattedCandidates = candidates
      .filter(
        (candidate) =>
          candidate.registerNumber &&
          candidate.dob &&
          candidate.email &&
          candidate.phone
      )
      .map((candidate) => ({
        registerNumber: candidate.registerNumber,
        dob: candidate.dob,
        email: candidate.email,
        phone: candidate.phone,
      }));

    // Validate and process the questions
    const validatedQuestions = questions.map((q, index) => {
      return {
        questionText: q.questionText,
        inputType: q.inputType,
        options: q.options,
        correctAnswers: q.correctAnswers || [],
        required: q.required,
        sector: q.sector,
      };
    });

    // Construct the updated test data with validated questions
    const updatedTestData = {
      testName,
      startDate,
      endDate,
      authOption,
      password: authOption === "custom" ? password : null,
      questions: validatedQuestions,
      candidates: formattedCandidates,
      malpractice, // Store as boolean
    };

    // Update the test in the database
    const updatedTest = await Test.findByIdAndUpdate(testId, updatedTestData, {
      new: true, // Return the updated document
      runValidators: true, // Run validation before update
    });

    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found" });
    }

    res
      .status(200)
      .json({ message: "Test updated successfully!", updatedTest });
  } catch (error) {
    console.error("Error updating test:", error);
    res.status(500).json({
      message: error.message || "Server error. Unable to update test.",
    });
  }
});

// GET route to fetch all tests (recently added)
app.get("/api/tests/recent", async (req, res) => {
  try {
    const tests = await Test.find(); // You can add filters or sorting if needed
    res.json(tests);
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Server error. Unable to fetch tests." });
  }
});

app.get("/api/tests/:testId", async (req, res) => {
  const { testId } = req.params;
  try {
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).send({ message: "Test not found" });
    }
    res.status(200).send(test);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 20000; // Use the environment variable for the port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
