import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  List,
  ListItem,
  ListItemText,
  Modal,
  Box,
  IconButton,
} from "@mui/material";
import AddQuestion from "../components/AddQuestion.tsx";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const EditTest = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [testName, setTestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authOption, setAuthOption] = useState("candidateInfo");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editOptions, setEditOptions] = useState([]);
  const [editCorrectAnswers, setEditCorrectAnswers] = useState([]);

  useEffect(() => {
    if (questions.length > 0) {
      sessionStorage.setItem(
        `test-questions-${testId}`,
        JSON.stringify(questions)
      );
    }
  }, [questions, testId]);

  useEffect(() => {
    // Retrieve the value of authOption from session storage when the component mounts
    const storedAuthOption = sessionStorage.getItem("authOption");
    if (storedAuthOption) {
      setAuthOption(storedAuthOption);
    }

    // Retrieve the password from session storage when the component mounts
    const storedPassword = sessionStorage.getItem("password");
    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);

  useEffect(() => {
    // Store the selected auth option in session storage whenever it changes
    sessionStorage.setItem("authOption", authOption);
  }, [authOption]);

  useEffect(() => {
    // Store the password in session storage whenever it changes
    sessionStorage.setItem("password", password);
  }, [password]);

  // Fetch test details when component mounts
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:20000/api/tests/${testId}`
        );
        const test = response.data;

        const formattedStartDate = test.startDate
          ? new Date(test.startDate.$date || test.startDate)
              .toISOString()
              .slice(0, 16)
          : "";
        const formattedEndDate = test.endDate
          ? new Date(test.endDate.$date || test.endDate)
              .toISOString()
              .slice(0, 16)
          : "";

        setTestName(test.testName);
        setStartDate(formattedStartDate);
        setEndDate(formattedEndDate);
        setAuthOption(test.authOption);
        setPassword(test.password || "");
        setQuestions(test.questions || []);
        setCandidates(test.candidates || []);

        // Check if questions are saved in sessionStorage
        const savedQuestions = JSON.parse(
          sessionStorage.getItem(`test-questions-${testId}`)
        );
        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
        } else {
          setQuestions(test.questions || []);
        }

        // Load candidates from local storage if available
        const savedCandidates =
          JSON.parse(sessionStorage.getItem("candidates")) || [];
        setCandidates(
          savedCandidates.length > 0 ? savedCandidates : test.candidates || []
        );
      } catch (error) {
        console.error("Error fetching test details:", error);
        alert("An error occurred while fetching test details.");
      }
    };

    fetchTestDetails();
  }, [testId]);

  // Save the edited candidate
  const handleSaveEditedCandidate = () => {
    const updatedCandidates = [...candidates];
    updatedCandidates[editingCandidate.index] = {
      registerNumber: editingCandidate.registerNumber,
      dob: editingCandidate.dob,
    };
    setCandidates(updatedCandidates);
    setEditingCandidate(null); // Clear editing state
  };

  // Save candidates to local storage whenever candidates state is updated
  useEffect(() => {
    if (candidates.length > 0) {
      sessionStorage.setItem("candidates", JSON.stringify(candidates));
    }
  }, [candidates]);

  const handleEditTest = async () => {
    const selectedCandidateData = candidates
      .filter((candidate) => selectedCandidates.includes(candidate._id))
      .map((candidate) => ({
        registerNumber: candidate.registerNumber,
        dob: candidate.dob,
        phone: candidate.phone, // Include phone
        email: candidate.email, // Include email
      }));

    const updatedTestData = {
      testName,
      startDate,
      endDate,
      authOption,
      password: authOption === "custom" ? password : "",
      questions: questions.map((q, index) => ({
        questionText: q.questionText,
        inputType: q.inputType,
        options: q.options,
        correctAnswerIndices:
          q.correctAnswerIndices.length > 0 ? q.correctAnswerIndices : null,
      })),
      candidates: selectedCandidateData,
      malpractice: false,
    };

    try {
      const response = await axios.put(
        `http://localhost:20000/api/tests/${testId}`,
        updatedTestData
      );
      alert("Test updated successfully!");
      sessionStorage.removeItem(`test-questions-${testId}`);
      sessionStorage.removeItem("candidates");
      setShowDetails(false);
    } catch (error) {
      console.error("Error updating test:", error);
      alert(
        "An error occurred while updating the test: " +
          error.response?.data?.message || error.message
      );
    }
  };

  // Open modal to edit question
  const handleEditClick = (index) => {
    const question = questions[index];
    setEditQuestionText(question.questionText);
    setEditOptions(question.options);
    setEditCorrectAnswers(question.correctAnswerIndices || []);
    setEditQuestionIndex(index);
    setEditModalOpen(true);
  };

  // Load selected candidates from sessionStorage when the component mounts (optional)
  useEffect(() => {
    const savedSelectedCandidates =
      sessionStorage.getItem("selectedCandidates");
    if (savedSelectedCandidates) {
      setSelectedCandidates(JSON.parse(savedSelectedCandidates));
    }
  }, []);

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidates((prevSelected) => {
      let updatedSelected;

      if (prevSelected.includes(candidateId)) {
        // If already selected, remove it
        updatedSelected = prevSelected.filter((id) => id !== candidateId);
      } else {
        // Otherwise, add it
        updatedSelected = [...prevSelected, candidateId];
      }

      // Save the updated selected candidates to sessionStorage
      sessionStorage.setItem(
        "selectedCandidates",
        JSON.stringify(updatedSelected)
      );

      return updatedSelected;
    });
  };

  // Save edited question and update in the database
  const handleSaveQuestion = async () => {
    const updatedQuestion = {
      questionText: editQuestionText,
      options: editOptions,
      correctAnswerIndices: editCorrectAnswers,
      inputType: "multiple-choice",
    };

    try {
      await axios.put(
        `http://localhost:20000/api/tests/${testId}/questions/${questions[editQuestionIndex]._id}`,
        updatedQuestion
      );

      const updatedQuestions = [...questions];
      updatedQuestions[editQuestionIndex] = {
        ...updatedQuestion,
        _id: questions[editQuestionIndex]._id, // Ensure the ID remains unchanged
      };
      setQuestions(updatedQuestions);
      alert("Question updated successfully!");
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating question:", error);
      alert("An error occurred while updating the question.");
    }
  };

  // Toggle the correct answer for multiple-choice questions
  const handleCorrectAnswerToggle = (optionIndex) => {
    const updatedCorrectAnswers = editCorrectAnswers.includes(optionIndex)
      ? editCorrectAnswers.filter((idx) => idx !== optionIndex)
      : [...editCorrectAnswers, optionIndex];
    setEditCorrectAnswers(updatedCorrectAnswers);
  };

  // Delete question
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const BackButton = () => {
    sessionStorage.removeItem(`test-questions-${testId}`);
    sessionStorage.removeItem("candidates");
    navigate(`/`);
  };

  console.log(questions);

  return (
    <>
      <Button onClick={BackButton}>Back</Button>
      <Container>
        <Typography variant="h4" gutterBottom>
          Edit Test
        </Typography>
        <TextField
          label="Test Name"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Start Date and Time"
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="End Date and Time"
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />

        {/* Conditional Rendering Based on Authentication Option */}
        {authOption === "custom" && (
          <TextField
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />
        )}

        {authOption === "candidateInfo" && (
          <>
            <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
              Select candidates
            </Typography>
            {candidates.map((candidate) => (
              <FormControlLabel
                key={candidate._id}
                control={
                  <Checkbox
                    checked={selectedCandidates.includes(candidate._id)}
                    onChange={() => handleCandidateSelect(candidate._id)}
                  />
                }
                label={`${candidate.email} - ${candidate.phone}`}
              />
            ))}
          </>
        )}

        <AddQuestion questions={questions} setQuestions={setQuestions} />

        {showDetails && (
          <>
            <Typography variant="h6" gutterBottom style={{ marginTop: "20px" }}>
              Added Questions
            </Typography>
            {questions && questions.length > 0 ? (
              <List>
                {questions.map((question, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <>
                        <IconButton
                          edge="end"
                          onClick={() => handleEditClick(index)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleDeleteQuestion(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={`Question ${index + 1}: ${
                        question.questionText
                      }`}
                      secondary={`Input Type: ${
                        question.inputType
                      } | Options: ${question.options.join(
                        ", "
                      )} | Correct Answers: ${
                        question.correctAnswerIndices.length > 0
                          ? question.correctAnswerIndices
                              .map((i) => question.options[i])
                              .join(", ")
                          : "N/A"
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No questions available yet.</Typography>
            )}

            {/* Edit Modal */}
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
              <Box sx={modalStyle}>
                <Typography variant="h6" gutterBottom>
                  Edit Question
                </Typography>
                <TextField
                  label="Question Text"
                  value={editQuestionText}
                  onChange={(e) => setEditQuestionText(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Options (comma separated)"
                  value={editOptions.join(", ")}
                  onChange={(e) =>
                    setEditOptions(
                      e.target.value.split(",").map((opt) => opt.trim())
                    )
                  }
                  fullWidth
                  margin="normal"
                />
                <Typography variant="body1" gutterBottom>
                  Correct Answers:
                </Typography>
                {editOptions.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={editCorrectAnswers.includes(index)}
                        onChange={() => handleCorrectAnswerToggle(index)}
                      />
                    }
                    label={option}
                  />
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveQuestion}
                >
                  Save Question
                </Button>
              </Box>
            </Modal>
          </>
        )}

        {editingCandidate && (
          <Box>
            <Typography variant="h6">Edit candidate</Typography>
            <TextField
              label="Register Number"
              value={editingCandidate.registerNumber}
              onChange={(e) =>
                setEditingCandidate({
                  ...editingCandidate,
                  registerNumber: e.target.value,
                })
              }
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date of Birth"
              value={editingCandidate.dob}
              onChange={(e) =>
                setEditingCandidate({
                  ...editingCandidate,
                  dob: e.target.value,
                })
              }
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEditedCandidate}
              fullWidth
              style={{ marginTop: "20px" }}
            >
              Save candidate
            </Button>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleEditTest}
          style={{ marginTop: "20px" }}
        >
          Update Test
        </Button>
      </Container>
    </>
  );
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

export default EditTest;
