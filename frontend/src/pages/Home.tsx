import React, { useState, useEffect } from "react";
import {
  IconButton,
  List,
  ListItem,
  CircularProgress,
  Checkbox,
  Button,
  TextField,
  Alert,
} from "@mui/material";

import AddQuestion from "../components/AddQuestion.tsx";
import axios from "axios";
import TestContainer from "../components/TestContainer.tsx";
import SearchIcon from "../assets/searchIcon.tsx";
import DefaultProfile from "../assets/userProfile.tsx";
import { Form, Input, Modal, Select, Popconfirm, Switch } from "antd";
import EditIcon from "../assets/EditIcon.tsx";
import TrashIcon from "../assets/TrashIcon.tsx";
import EyeIcon from "../assets/EyeIcon.tsx";
import { showToast } from "../toastUtil.js";
import AddedQuestions from "../components/AddedQuestions.tsx";

const { Option } = Select;
const { TextArea } = Input;

interface Question {
  id: string;
  inputType: string;
  sector: string;
  questionText: string;
  options: string[];
  correctAnswers: string[];
  required: boolean;
  index: number;
}

interface Candidate {
  _id: string;
  name: string;
  profilePicture?: string;
  email: string;
  dob?: string;
  phone?: string;
}

type EditingQuestion = {
  sector: string;
  options: string[]; // Ensure options is always a string array
  questionText?: string;
  correctAnswers: string[]; // correctAnswers should always be a string array
};

const Home = () => {
  const [sectorOptions, setSectorOptions] = useState([]);
  const [viewQuestionIndex, setViewQuestionIndex] = useState(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] =
    useState<EditingQuestion | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [testName, setTestName] = useState(
    localStorage.getItem("testName") || ""
  );
  const [startDate, setStartDate] = useState(
    localStorage.getItem("startDate") || ""
  );
  const [warning, setWarning] = useState("");
  const [endDate, setEndDate] = useState(localStorage.getItem("endDate") || "");
  const [authOption, setAuthOption] = useState("candidateInfo");
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [inputTypes, setInputTypes] = useState<string[]>([
    "Multiple Choice",
    "Select",
    "Radio",
    "Text Input",
  ]);
  const [showDetails, setShowDetails] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const [questionTypes] = useState([
    "Multiple Choice",
    "Select",
    "Radio",
    "Text Input",
  ]);

  console.log(inputTypes);

  const [isRequired, setIsRequired] = useState(
    editingQuestion?.required || false
  );

  // useEffect(() => {
  //   // Fetch available sector options when the component loads
  //   const fetchSectorOptions = async () => {
  //     try {
  //       const response = await axios.get("http://localhost:20000/api/tests");
  //       setSectorOptions(response.data);
  //     } catch (error) {
  //       console.error("Error fetching sector options:", error);
  //     }
  //   };

  //   fetchSectorOptions();
  // }, []);

  const handleSectorChange = (newSector) => {
    // Update the state to reflect the new sector value
    setEditingQuestion((prev) => ({
      ...prev,
      sector: newSector,
    }));
  };

  useEffect(() => {
    if (editingQuestion) {
      setIsRequired(editingQuestion.required); // Initialize isRequired when editingQuestion changes
    }
  }, [editingQuestion]);

  // Load questions from localStorage when the component mounts
  useEffect(() => {
    const storedQuestions = JSON.parse(
      localStorage.getItem("questions") as string
    );
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

  // Fetch candidates from API or localStorage on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "http://localhost:20000/api/testCandidates"
        );
        const data = await response.json();

        const selectedCandidates = data.map((candidate: any) => {
          if (candidate.profilePicture) {
            return {
              ...candidate,
              profilePicture: `http://localhost:20000/uploads/${candidate.profilePicture}`,
            };
          }
          return candidate;
        });

        setCandidates(selectedCandidates);
        // localStorage.setItem("candidates", JSON.stringify(selectedCandidates)); // Store fetched candidates in localStorage
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };

    // const storedCandidates = localStorage.getItem("candidates");
    const storedSelectedCandidates =
      sessionStorage.getItem("selectedCandidates");

    // if (storedCandidates) {
    //   setCandidates(JSON.parse(storedCandidates));
    // } else {
    fetchCandidates();
    // }

    if (storedSelectedCandidates) {
      setSelectedCandidates(JSON.parse(storedSelectedCandidates));
    }
  }, []);

  const handleCreateTest = async (event) => {
    event.preventDefault();
    setLoading(true);
    setWarning("");

    // Validate required fields
    if (!testName || !startDate || !endDate) {
      setWarning("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Validate that there are questions
    if (questions.length === 0) {
      setWarning("Please add at least one question.");
      setLoading(false);
      return;
    }

    // Find the selected candidates by matching _id with selectedCandidates array
    const selectedCandidateData = candidates
      .filter((candidate: any) => selectedCandidates.includes(candidate._id))
      .map((candidate: any) => ({
        name: candidate.name || "",
        dob: candidate.dob || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
      }));

    console.log("Candidates", selectedCandidateData);
    console.log("CandidatesID", selectedCandidates);

    // Convert startDate and endDate to UTC before sending to backend
    const utcStartDate = new Date(startDate).toISOString();
    const utcEndDate = new Date(endDate).toISOString();

    // Map the questions array
    const testData = {
      testName,
      startDate: utcStartDate,
      endDate: utcEndDate,
      authOption,
      password: authOption === "custom" ? password : "",
      questions: questions.map((q: any) => ({
        questionText: q.questionText,
        inputType: q.inputType,
        options: q.options,
        correctAnswers: q.correctAnswers ? q.correctAnswers : [],
        required: q.required || false,
        sector: q.sector,
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
      showToast("Test created successfully!");
      resetForm();
    } catch (error) {
      console.error("Error while creating test:", error);
      showToast("An error occurred while creating the test.");
    } finally {
      setLoading(false);
    }
  };

  // const resetCandidate = () => {
  // setCandidates([]);
  // setSelectedCandidates([]);
  //   localStorage.removeItem("candidates");
  //   localStorage.removeItem("selectedCandidates");
  // };

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

    // Remove items from localStorage
    localStorage.removeItem("candidates");
    localStorage.removeItem("questions");
    localStorage.removeItem("selectedCandidates");

    // Refresh the page
    window.location.reload(); // This will refresh the page
  };

  // Update localStorage whenever selected candidates change
  useEffect(() => {
    if (selectedCandidates.length > 0) {
      sessionStorage.setItem(
        "selectedCandidates",
        JSON.stringify(selectedCandidates)
      );
    }
  }, [selectedCandidates]);

  // Function to handle candidate selection/deselection
  const handleCandidateSelect = (candidateId: string) => {
    setSelectedCandidates(
      (prevSelected) =>
        prevSelected.includes(candidateId)
          ? prevSelected.filter((id) => id !== candidateId) // Deselect if already selected
          : [...prevSelected, candidateId] // Select if not already selected
    );
  };

  // Filtering candidates based on search query
  const filteredCandidates: Candidate[] = candidates.filter(
    (candidate: any) => {
      const query = searchQuery.toLowerCase();
      return (
        candidate.name.includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        candidate.phone.includes(query)
      );
    }
  );

  useEffect(() => {
    // If the length of selected candidates matches the filtered candidates, set selectAll to true
    if (
      selectedCandidates.length === filteredCandidates.length &&
      filteredCandidates.length > 0
    ) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedCandidates, filteredCandidates]);

  // Handle select all logic
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all candidates
      setSelectedCandidates([]);
      // Clear sessionStorage since no candidates are selected
      sessionStorage.setItem("selectedCandidates", JSON.stringify([]));
    } else {
      // Select all filtered candidates
      const allCandidateIds = filteredCandidates.map(
        (candidate: Candidate) => candidate._id
      );
      setSelectedCandidates(allCandidateIds);
      // Update sessionStorage with all selected candidate IDs
      sessionStorage.setItem(
        "selectedCandidates",
        JSON.stringify(allCandidateIds)
      );
    }

    // Toggle selectAll state
    setSelectAll(!selectAll);
  };

  const handleCorrectAnswerSelect = (selectedIndices: number[] | number) => {
    setEditingQuestion((prev) => {
      if (!prev) {
        // If the previous state is null, initialize it with default values
        return {
          options: [], // Ensure options is an empty array initially
          correctAnswers: Array.isArray(selectedIndices)
            ? selectedIndices.map(String) // Convert numbers to strings
            : [String(selectedIndices)], // Convert single number to string
        };
      }

      const newCorrectAnswers = Array.isArray(selectedIndices)
        ? selectedIndices.map(String) // Convert all numbers to strings
        : [String(selectedIndices)]; // Convert single number to string

      return {
        ...prev,
        correctAnswers: newCorrectAnswers, // Update correctAnswers
      };
    });
  };

  const handleQuestionTextChange = (text: string) => {
    setEditingQuestion((prev) => ({
      ...prev,
      questionText: text,
      correctAnswers: prev?.correctAnswers || [], // Ensure correctAnswers is always an array
      options: prev?.options || [], // Ensure options is always an array (even if it's not defined)
    }));
  };

  const handleInputTypeChange = (newInputType: any) => {
    setEditingQuestion((prev) => ({
      ...prev,
      inputType: newInputType,
      correctAnswers: [], // Ensure correctAnswers is always an array
      options: prev?.options || [], // Ensure options is always an array
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setEditingQuestion((prev) => {
      // Ensure options and correctAnswers are arrays, even if undefined
      const newOptions = [...(prev?.options || [])];
      newOptions[index] = value;

      return {
        ...prev,
        options: newOptions,
        correctAnswers: prev?.correctAnswers || [], // Ensure correctAnswers is always an array
      };
    });
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  // Handle candidate selection modal open
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  // Handle candidate selection modal close
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleViewQuestion = (sector, index) => {
    const question = groupedQuestions[sector][index]; // Get the question by sector and index
    setViewQuestionIndex(question.originalIndex); // Use the original index for identifying
    setIsViewModalOpen(true);
  };

  // Handle Editing a question
  const handleEditQuestion = (sector, index) => {
    console.log(groupedQuestions, questions);

    const question = groupedQuestions[sector][index]; // Get the question by sector and index
    const originalQuestion = questions[question.originalIndex]; // Get the original question from the main list using the originalIndex

    // Set the question to be edited with all its properties and include originalIndex
    setEditingQuestion({
      ...originalQuestion,
      originalIndex: question.originalIndex,
      sector: sector, // Ensure sector is properly set
    });

    setIsEditModalOpen(true);
  };

  // Handle Saving the Edited Question
  const handleSaveEditedQuestion = () => {
    const updatedQuestions = [...questions]; // Create a copy of the questions array

    // Create the updated question object, preserving the sector and required status
    const updatedQuestion = {
      ...editingQuestion,
      required: isRequired,
      sector: editingQuestion.sector, // Make sure sector is updated properly
    };

    // Update the original question in the list
    updatedQuestions[editingQuestion.originalIndex] = updatedQuestion;

    // Update the state
    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
    console.log(`Question at index ${index} deleted.`);
  };

  const groupedQuestions = questions.reduce((groups, question, idx) => {
    const { sector } = question; // Assuming each question has a 'sector' property
    if (!groups[sector]) {
      groups[sector] = [];
    }
    groups[sector].push({ ...question, originalIndex: idx }); // Store original index in question object
    return groups;
  }, {});

  const handleConfirmDelete = (sector, index) => {
    const question = groupedQuestions[sector][index];
    handleDeleteQuestion(question.originalIndex); // Use the original index for deletion
  };

  const handleStartDateChange = (e) => {
    const localDate = e.target.value;
    setStartDate(localDate); // Store local date for display in the input
  };

  const handleEndDateChange = (e) => {
    const localDate = e.target.value;
    setEndDate(localDate); // Store local date for display in the input
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="w-full p-6 h-[calc(100vh-50px)] overflow-y-scroll scroll-smooth">
          <TestContainer />
        </div>
        <div className="min-w-[450px] shadow-gray-300 p-6 shadow-inner h-[calc(100vh-50px)] overflow-y-scroll scroll-smooth">
          {warning && <Alert severity="warning">{warning}</Alert>}
          <h1 className="text-[25px] poppins2 text-[#083344]">Create Test</h1>
          <Input
            required
            placeholder="Test Name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="mt-5"
            style={{
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              padding: "8px 12px",
            }}
          />

          <h1 className="poppins2 text-[20px] mt-6 text-[#083344]">
            Test Duration
          </h1>
          <div className="w-full justify-between flex items-center mt-1.5 gap-3">
            <TextField
              className="bg-white rounded shadow-md"
              label="Start Date and Time"
              type="datetime-local"
              value={startDate}
              onChange={handleStartDateChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              className="bg-white rounded shadow-md"
              label="End Date and Time"
              type="datetime-local"
              value={endDate}
              onChange={handleEndDateChange}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>

          {authOption === "candidateInfo" && (
            <>
              <div className="w-full flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal}
                  style={{
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
                closable={false}
                footer={null}
                aria-labelledby="select-students-modal-title"
                aria-describedby="select-students-modal-description"
                className="flex justify-center items-center"
              >
                <div
                  className="w-[50vw] h-[70vh] justify-start flex flex-col mx-auto"
                  style={{
                    padding: "5px",
                    background: "#fff",
                    borderRadius: "8px",
                  }}
                >
                  <div className="">
                    <div className="flex justify-between items-start">
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
                      <div className="flex justify-between mt-2 mb-3 items-center gap-1">
                        <SearchIcon />
                        <TextField
                          className="poppins text-[16px] font-medium text-slate-300"
                          placeholder="Search candidates"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          size="small"
                          InputProps={{
                            sx: {
                              color: "gray",
                              fontWeight: "500",
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
                        href="#"
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
                      {/* <Button
                        href="#"
                        type="primary"
                        onClick={resetCandidate}
                        style={{
                          backgroundColor: "#8298a2",
                          borderColor: "#083344",
                          color: "white",
                          marginLeft: "auto",
                        }}
                      >
                        <p
                          className="poppins2 text-[12px] px-0.5 normal-case text-white"
                          style={{
                            textDecorationThickness: "1.5px",
                            textUnderlineOffset: "2px",
                          }}
                        >
                          Refresh
                        </p>
                      </Button> */}
                    </div>
                  </div>

                  <div className="overflow-y-scroll">
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
                              checked={selectedCandidates.includes(
                                candidate._id
                              )}
                              onChange={() =>
                                handleCandidateSelect(candidate._id)
                              }
                              style={{ display: "none" }} // Hide the checkbox
                            />
                            {candidate.profilePicture ? (
                              <img
                                src={candidate.profilePicture}
                                alt={`${candidate.name}'s profile`}
                                className="w-10 h-10 bg-slate-400 p-2.5 rounded-lg mr-4"
                              />
                            ) : (
                              <div className="bg-slate-200 rounded-lg w-10 h-10 flex justify-center items-center mr-4">
                                <DefaultProfile />
                              </div>
                            )}
                            <div className="flex flex-col justify-between items-start flex-grow">
                              <text className="poppins2 text-[15px] text-black">{`${candidate.name}`}</text>
                              <text className="montserrat text-[14px] text-gray-500">{`${
                                candidate.email || "Email not available"
                              } - ${
                                candidate.phone || "Phone not available"
                              }`}</text>
                            </div>
                            {selectedCandidates.includes(candidate._id) && (
                              <Button
                                href=""
                                type="primary"
                                style={{
                                  backgroundColor: "#083344",
                                  borderColor: "#083344",
                                  color: "white",
                                  marginLeft: "auto",
                                  borderRadius: "5px",
                                  height: "36px",
                                  padding: 0,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCandidateSelect(candidate._id); // Use candidate._id correctly
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
                </div>
              </Modal>
            </>
          )}

          <div className="">
            <h1 className="text-[20px] poppins2 text-[#083344]">
              Create Question
            </h1>
            <AddQuestion questions={questions} setQuestions={setQuestions} />
          </div>

          {showDetails && (
            <AddedQuestions
              questions={questions}
              handleViewQuestion={handleViewQuestion}
              handleEditQuestion={handleEditQuestion}
              handleConfirmDelete={handleConfirmDelete}
              isViewModalOpen={isViewModalOpen}
              handleCloseViewModal={handleCloseViewModal}
              viewQuestionIndex={viewQuestionIndex}
              isEditModalOpen={isEditModalOpen}
              editingQuestion={editingQuestion}
              editQuestionIndex={editQuestionIndex}
              handleSaveEditedQuestion={handleSaveEditedQuestion}
              isRequired={isRequired}
              setIsRequired={setIsRequired}
              sectorOptions={sectorOptions}
              handleSectorChange={handleSectorChange}
              handleQuestionTextChange={handleQuestionTextChange}
              handleInputTypeChange={handleInputTypeChange}
              questionTypes={questionTypes}
              handleOptionChange={handleOptionChange}
              handleCorrectAnswerSelect={handleCorrectAnswerSelect}
              setIsEditModalOpen={setIsEditModalOpen}
            />
          )}

          <div className="w-full flex justify-between gap-3 items-center">
            <Popconfirm
              title="Are you sure you want to reset all the test details?"
              onConfirm={resetForm} // Call resetForm on confirm
              onCancel={() => console.log("Reset cancelled")} // Log if cancelled
              okText="Yes, Reset"
              cancelText="Cancel"
              placement="topRight" // Optional: Set placement for where the popconfirm appears
            >
              <Button
                variant="contained"
                color="primary"
                style={{
                  width: "100%",
                  marginBottom: "20px",
                  marginTop: "20px",
                  background: "#8298a2",
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
                  Reset Test Details
                </p>
              </Button>
            </Popconfirm>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateTest}
              style={{
                width: "100%",
                marginBottom: "20px",
                marginTop: "20px",
                background: "#083344",
                color: "#fff",
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  size={24}
                  style={{ color: "#fff", marginRight: "10px" }}
                />
              ) : null}
              <p
                className="poppins text-[15px] px-0.5 normal-case text-white"
                style={{
                  textDecorationThickness: "1.5px",
                  textUnderlineOffset: "2px",
                }}
              >
                {loading ? "Creating..." : "Create Test"}
              </p>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
