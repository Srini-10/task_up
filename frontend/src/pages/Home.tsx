import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  Radio,
  FormControl,
  FormControlLabel,
  Modal,
} from "@mui/material";
import AddQuestion from "../components/AddQuestion.tsx";
// import Addcandidate from "../components/Addcandidate.tsx";
import axios from "axios";
import TestContainer from "../components/TestContainer.tsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "../assets/Search_Icon.svg";
import DefaultProfile from "../assets/User_Profile.svg";

const Home = () => {
  const [testName, setTestName] = useState(
    localStorage.getItem("testName") || ""
  );
  const [startDate, setStartDate] = useState(
    localStorage.getItem("startDate") || ""
  );
  const [endDate, setEndDate] = useState(localStorage.getItem("endDate") || "");
  const [authOption, setAuthOption] = useState("candidateInfo");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [inputTypes, setInputTypes] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  // Load questions from localStorage when the component mounts
  useEffect(() => {
    const storedQuestions = JSON.parse(localStorage.getItem("questions"));
    if (storedQuestions && storedQuestions.length > 0) {
      setQuestions(storedQuestions);
    }
  }, []);

  // Store questions in localStorage whenever they are updated
  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(questions));
  }, [questions]);

  // Save test name, start date, and end date in localStorage
  useEffect(() => {
    localStorage.setItem("testName", testName);
    localStorage.setItem("startDate", startDate);
    localStorage.setItem("endDate", endDate);
  }, [testName, startDate, endDate]);

  useEffect(() => {
    const fetchInputTypes = async () => {
      try {
        const response = await axios.get(
          "http://localhost:20000/api/inputTypes"
        );
        setInputTypes(response.data);
      } catch (error) {
        console.error("Error fetching input types:", error);
      }
    };

    fetchInputTypes();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:20000/api/testCandidates"
      );
      setCandidates(response.data);
      console.log(response.data);
      localStorage.setItem("candidates", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    // Load candidates from localStorage or API when component mounts
    const storedCandidates = JSON.parse(localStorage.getItem("candidates"));
    const storedSelectedCandidates = JSON.parse(
      localStorage.getItem("selectedCandidates")
    );

    if (storedCandidates && storedCandidates.length > 0) {
      setCandidates(storedCandidates);
    } else {
      fetchCandidates(); // Fetch from the API only if not in localStorage
    }

    if (storedSelectedCandidates) {
      setSelectedCandidates(storedSelectedCandidates);
    }
  }, []);

  // Store candidates and selectedCandidates in localStorage on change

  const handleCreateTest = async (event) => {
    event.preventDefault();
    // Find the selected candidates by matching _id with selectedCandidates array
    const selectedCandidateData = candidates
      .filter((candidate) => selectedCandidates.includes(candidate._id))
      .map((candidate) => ({
        registerNumber: candidate.registerNumber,
        dob: candidate.dob,
        email: candidate.email,
        phone: candidate.phone,
      }));

    const testData = {
      testName,
      startDate,
      endDate,
      authOption,
      password: authOption === "custom" ? password : "",
      questions: questions.map((q) => ({
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
      const response = await axios.post(
        "http://localhost:20000/api/tests",
        testData
      );
      console.log(response.data);
      alert("Test created successfully!");
      resetForm();
    } catch (error) {
      alert("An error occurred while creating the test.");
    }
  };

  const resetForm = () => {
    setTestName("");
    setStartDate("");
    setEndDate("");
    setAuthOption("candidateInfo");
    setPassword("");
    setQuestions([]);
    setCandidates([]);
    setSelectedCandidates([]);
    setShowDetails(false);
    localStorage.removeItem("candidates");
    localStorage.removeItem("questions");
    localStorage.removeItem("selectedCandidates");
  };

  useEffect(() => {
    const savedSelectedCandidates = localStorage.getItem("selectedCandidates");
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
      localStorage.setItem(
        "selectedCandidates",
        JSON.stringify(updatedSelected)
      );

      return updatedSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]); // Deselect all
    } else {
      setSelectedCandidates(
        filteredCandidates.map((candidate) => candidate._id)
      ); // Select all
    }
    setSelectAll(!selectAll); // Toggle select all state
  };

  // Handle candidate selection modal open
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  // Handle candidate selection modal close
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Handle Adding a new question
  const handleAddQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
  };

  // Handle Editing a question
  const handleEditQuestion = (index) => {
    setEditingQuestion({ ...questions[index], index });
  };

  // Handle Saving the Edited Question
  const handleSaveEditedQuestion = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestion.index] = editingQuestion;
    setQuestions(updatedQuestions);
    setEditingQuestion(null); // Clear the editing state after saving
  };

  // Filtering candidates based on search query
  const filteredCandidates = candidates.filter((candidate) => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.includes(query) ||
      candidate.registerNumber.includes(query) ||
      (candidate.dob && candidate.dob.includes(query)) // Ensure dob is not null
    );
  });

  return (
    <>
      <div className="flex justify-between p-6 gap-6">
        <div className="w-full">
          <TestContainer />
        </div>
        <div className="min-w-[450px]">
          <h1 className="text-[25px] poppins2 text-[#083344]">Create Test</h1>
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

          {authOption === "candidateInfo" && (
            <>
              <div className="w-full flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal}
                  style={{
                    marginBottom: "20px",
                    marginTop: "20px",
                    background: "#083344",
                    color: "#fff",
                  }}
                >
                  <p
                    className="poppins text-[15px] px-0.5 normal-case text-white"
                    style={{
                      textDecorationThickness: "1.5px",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    Select Candidates
                  </p>
                </Button>
              </div>

              {/* Modal for selecting candidates */}
              <Modal
                open={modalVisible}
                onClose={handleCloseModal}
                aria-labelledby="select-students-modal-title"
                aria-describedby="select-students-modal-description"
                className="flex justify-center items-center"
              >
                <div
                  className="w-[50vw] h-[70vh] justify-start flex flex-col  mx-auto"
                  style={{
                    padding: "20px",
                    background: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  <div className="">
                    <div className="flex justify-between items-center">
                      <h2
                        id="select-students-modal-title"
                        className="poppins2 text-[22px]"
                      >
                        Select Candidates
                      </h2>
                      <Button onClick={handleCloseModal}>
                        <p
                          className="poppins2 normal-case text-black"
                          style={{
                            textDecoration: "underline",
                            textDecorationThickness: "1.5px",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          Close
                        </p>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex justify-between items-center gap-1">
                        <img className="w-7 mt-2" src={SearchIcon} alt="" />
                        <TextField
                          className="poppins text-[16px] text-slate-300"
                          placeholder="Search candidates"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          fullWidth
                          margin="normal"
                          variant="outlined"
                          size="small"
                          InputProps={{
                            sx: {
                              border: "none",
                              outline: "none",
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                              },
                            },
                          }}
                        />
                      </div>
                      <Button
                        type="primary"
                        onClick={handleSelectAll}
                        style={{
                          backgroundColor: "#083344",
                          borderColor: "#083344",
                          color: "white",
                          marginLeft: "auto", // Align button to the right
                        }}
                      >
                        <p
                          className="poppins2 text-[12px] px-0.5 normal-case text-white"
                          style={{
                            textDecorationThickness: "1.5px",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          {selectAll ? "Deselect All" : "Select All"}
                        </p>
                      </Button>
                    </div>
                  </div>

                  <List>
                    {filteredCandidates.map((candidate) => (
                      <ListItem key={candidate._id} className="items-start">
                        <div
                          className={`w-full flex justify-start items-center -my-[6.5px] h-16 rounded-lg p-6 border-b-[1.5px] hover:bg-[#e7ebec] border-gray-200 cursor-pointer ${
                            selectedCandidates.includes(candidate._id)
                              ? "bg-[#d9e5e7]"
                              : ""
                          }`}
                          onClick={() => handleCandidateSelect(candidate._id)} // Handle selection on click
                        >
                          <Checkbox
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={() =>
                              handleCandidateSelect(candidate._id)
                            }
                            style={{ display: "none" }} // Hide the checkbox
                          />
                          <img
                            src={
                              candidate.profilePicture
                                ? candidate.profilePicture
                                : DefaultProfile
                            }
                            alt={`${candidate.registerNumber}'s profile`}
                            className="w-10 h-10 bg-slate-400 p-2.5 rounded-lg mr-4"
                          />
                          <div className="flex flex-col justify-between items-start flex-grow">
                            <text className="poppins2 text-[15px] text-black">{`${candidate.registerNumber} - ${candidate.email}`}</text>
                            <text className="montserrat text-[14px] text-gray-500">
                              {`${candidate.dob || "DOB not available"} - ${
                                candidate.phone || "Phone not available"
                              }`}
                            </text>
                          </div>
                          {selectedCandidates.includes(candidate._id) && ( // Conditionally render the button
                            <Button
                              type="primary"
                              shape="circle"
                              style={{
                                backgroundColor: "#083344",
                                borderColor: "#083344",
                                color: "white",
                                marginLeft: "auto", // Align button to the right
                              }}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent click from triggering the list item click
                                handleCandidateSelect(candidate._id); // Handle check action
                              }}
                            >
                              ✔
                            </Button>
                          )}
                        </div>
                      </ListItem>
                    ))}
                  </List>
                </div>
              </Modal>
            </>
          )}

          <h1 className="text-[20px] poppins2 text-[#083344]">
            Create Question
          </h1>
          <AddQuestion
            questions={questions}
            setQuestions={setQuestions}
            inputTypes={inputTypes}
            onAddQuestion={handleAddQuestion}
          />

          {showDetails && (
            <>
              <Typography
                variant="h6"
                gutterBottom
                style={{ marginTop: "20px" }}
              >
                Added Questions
              </Typography>
              <List>
                {questions.map((question, index) => (
                  <ListItem key={index}>
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
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditQuestion(index)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteQuestion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>

              {editingQuestion && (
                <Box>
                  <Typography variant="h6">Edit Question</Typography>
                  <TextField
                    label="Question"
                    value={editingQuestion.questionText}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        questionText: e.target.value,
                      })
                    }
                    fullWidth
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Question Type</InputLabel>
                    <Select
                      value={editingQuestion.inputType}
                      onChange={(e) =>
                        setEditingQuestion((prev) => ({
                          ...prev,
                          inputType: e.target.value,
                          correctAnswerIndices: [],
                        }))
                      }
                    >
                      {inputTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Display options only if it's not a Text Input */}
                  {editingQuestion.inputType !== "Text Input" && (
                    <>
                      <Typography>Options</Typography>
                      {editingQuestion.options.map((option, index) => (
                        <TextField
                          key={index}
                          label={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) =>
                            setEditingQuestion((prev) => {
                              const newOptions = [...prev.options];
                              newOptions[index] = e.target.value;
                              return { ...prev, options: newOptions };
                            })
                          }
                          fullWidth
                          margin="normal"
                        />
                      ))}
                    </>
                  )}

                  {/* Radio button correct answer logic */}
                  {editingQuestion.inputType === "Radio" && (
                    <Box>
                      <Typography>Correct Answer</Typography>
                      {editingQuestion.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Radio
                              checked={editingQuestion.correctAnswerIndices.includes(
                                index
                              )}
                              onChange={() => {
                                setEditingQuestion((prev) => ({
                                  ...prev,
                                  correctAnswerIndices: [index], // Only one correct answer allowed for Radio
                                }));
                              }}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Checkbox correct answers logic */}
                  {editingQuestion.inputType === "Checkbox" && (
                    <Box>
                      <Typography>Correct Answers</Typography>
                      {editingQuestion.options.map((option, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              checked={editingQuestion.correctAnswerIndices.includes(
                                index
                              )}
                              onChange={() => {
                                setEditingQuestion((prev) => {
                                  const updatedCorrectAnswers =
                                    prev.correctAnswerIndices.includes(index)
                                      ? prev.correctAnswerIndices.filter(
                                          (i) => i !== index
                                        )
                                      : [...prev.correctAnswerIndices, index];
                                  return {
                                    ...prev,
                                    correctAnswerIndices: updatedCorrectAnswers,
                                  };
                                });
                              }}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveEditedQuestion}
                    fullWidth
                    style={{ marginTop: "20px" }}
                  >
                    Save Question
                  </Button>
                </Box>
              )}
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateTest}
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Create Test
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={resetForm}
            fullWidth
            style={{ marginTop: "20px" }}
          >
            Reset Test Details
          </Button>
        </div>
      </div>
    </>
  );
};

export default Home;
