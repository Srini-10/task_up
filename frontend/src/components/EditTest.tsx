import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Checkbox,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import AddQuestion from "../components/AddQuestion.tsx";
import axios from "axios";
import { useParams } from "react-router-dom";
import SearchIcon from "../assets/Search_Icon.svg";
import DefaultProfile from "../assets/User_Profile.svg";
import EditIcon from "../assets/EditIcon.tsx";
import TrashIcon from "../assets/TrashIcon.tsx";
import EyeIcon from "../assets/EyeIcon.tsx";
import { showToast } from "../toastUtil.js";
import { Form, Input, Modal, Select, Popconfirm, Spin, Switch } from "antd";
import AddedQuestions from "./AddedQuestions.tsx";

const { Option } = Select;
const { TextArea } = Input;

type Candidate = {
  profilePicture?: any;
  _id: never;
  name: string;
  dob: string;
  phone: string;
  email: string;
};

type Question = {
  questionText: string;
  inputType: string;
  options: string[];
  correctAnswers: any[];
  required: boolean;
  sector: string;
};

// type EditingQuestion = {
//   options: string[];
//   questionText?: string;
//   correctAnswers: string[];
//   inputType?: string;
// };

const EditTest = () => {
  const { testId } = useParams();
  const [sectorOptions, setSectorOptions] = useState([]);
  const [viewQuestionIndex, setViewQuestionIndex] = useState(null);
  const [testName, setTestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authOption, setAuthOption] = useState("candidateInfo");
  const [updatedCandidates, setUpdatedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] =
    useState<EditingQuestion | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  console.log(showDetails);

  const [questionTypes] = useState([
    "Multiple Choice",
    "Select",
    "Radio",
    "Text Input",
  ]);

  const [isRequired, setIsRequired] = useState(
    editingQuestion?.required || false
  );

  useEffect(() => {
    if (editingQuestion) {
      setIsRequired(editingQuestion.required); // Initialize isRequired when editingQuestion changes
    }
  }, [editingQuestion]);

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

  // Fetch candidates on component mount and persist the selected ones
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:20000/api/testCandidates"
        );
        const fetchedCandidates = response.data;

        // Load previously selected candidates from sessionStorage
        const storedUpdatedCandidates =
          JSON.parse(sessionStorage.getItem("updatedCandidates")) || [];

        // Ensure selected candidates only include valid ones from the current fetched candidates
        const validSelectedCandidates = storedUpdatedCandidates.filter((id) =>
          fetchedCandidates.some((candidate) => candidate._id === id)
        );

        // Update state with fetched candidates and valid selected candidates
        setCandidates(fetchedCandidates);
        setUpdatedCandidates(validSelectedCandidates);

        // Store the valid selected candidates back in sessionStorage
        sessionStorage.setItem(
          "updatedCandidates",
          JSON.stringify(validSelectedCandidates)
        );
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Persist the selected candidates from sessionStorage when the component mounts
  // useEffect(() => {
  //   const savedSelectedCandidates = sessionStorage.getItem("updatedCandidates");
  //   if (savedSelectedCandidates) {
  //     setUpdatedCandidates(JSON.parse(savedSelectedCandidates));
  //   }
  // }, []);

  const handleCandidateSelect = (candidateId) => {
    setUpdatedCandidates((prevSelected) => {
      let updatedSelected;

      // If the candidate is already selected, deselect it
      if (prevSelected.includes(candidateId)) {
        updatedSelected = prevSelected.filter((id) => id !== candidateId);
      } else {
        // Otherwise, add the candidate to the selected list
        updatedSelected = [...prevSelected, candidateId];
      }

      // Store the updated selected candidates in sessionStorage
      sessionStorage.setItem(
        "updatedCandidates",
        JSON.stringify(updatedSelected)
      );

      return updatedSelected;
    });
  };

  useEffect(() => {
    // Store the selected auth option in session storage whenever it changes
    sessionStorage.setItem("authOption", authOption);
  }, [authOption]);

  useEffect(() => {
    // Store the password in session storage whenever it changes
    sessionStorage.setItem("password", password);
  }, [password]);

  useEffect(() => {
    // Fetch available sector options when the component loads
    const fetchSectorOptions = async () => {
      try {
        const response = await axios.get("/api/tests");
        setSectorOptions(response.data);
      } catch (error) {
        console.error("Error fetching sector options:", error);
      }
    };

    fetchSectorOptions();
  }, []);

  const handleSectorChange = (newSector) => {
    // Update the state to reflect the new sector value
    setEditingQuestion((prev) => ({
      ...prev,
      sector: newSector,
    }));
  };

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
              .toLocaleString("sv-SE", { timeZoneName: "short" }) // Converts to local time
              .slice(0, 16) // Format as YYYY-MM-DDTHH:MM for `datetime-local`
          : "";

        const formattedEndDate = test.endDate
          ? new Date(test.endDate.$date || test.endDate)
              .toLocaleString("sv-SE", { timeZoneName: "short" }) // Converts to local time
              .slice(0, 16) // Format as YYYY-MM-DDTHH:MM for `datetime-local`
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
          sessionStorage.getItem(`test-questions-${testId}`)!
        );

        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setIsLoading(false);
        } else {
          setQuestions(test.questions || []);
        }

        // Load candidates from local storage if available
        const savedCandidates =
          JSON.parse(sessionStorage.getItem("candidates")!) || [];
        setCandidates(
          savedCandidates.length > 0 ? savedCandidates : test.candidates || []
        );

        // Enable the button after fetching test details
        setIsButtonDisabled(false);
      } catch (error) {
        console.error("Error fetching test details:", error);
        showToast("An error occurred while fetching test details.");
      }
    };

    fetchTestDetails();
  }, [testId]);

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  // Handle candidate selection modal close
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleEditTest = async () => {
    if (isButtonDisabled) {
      alert("Please wait, questions are still being fetched.");
    } else {
      const selectedCandidateData = candidates
        .filter((candidate: Candidate) =>
          updatedCandidates.includes(candidate._id)
        )
        .map((candidate: Candidate) => ({
          name: candidate.name,
          dob: candidate.dob,
          phone: candidate.phone,
          email: candidate.email,
        }));

      // Convert startDate and endDate to UTC before sending to backend
      const utcStartDate = new Date(startDate).toISOString();
      const utcEndDate = new Date(endDate).toISOString();

      const updatedTestData = {
        testName,
        startDate: utcStartDate,
        endDate: utcEndDate,
        authOption,
        password: authOption === "custom" ? password : "",
        questions: questions.map((q: Question, index) => ({
          questionText: q.questionText,
          inputType: q.inputType,
          options: q.options,
          correctAnswers: q.correctAnswers.length > 0 ? q.correctAnswers : null,
          required: q.required || false,
          sector: q.sector,
        })),
        candidates: selectedCandidateData,
        malpractice: false,
      };

      try {
        await axios.put(
          `http://localhost:20000/api/tests/${testId}`,
          updatedTestData
        );
        showToast("Test updated successfully!");
        sessionStorage.removeItem(`test-questions-${testId}`);
        sessionStorage.removeItem("candidates");
        setShowDetails(false);
      } catch (error) {
        console.error("Error updating test:", error);
        showToast(
          "An error occurred while updating the test: " +
            error.response?.data?.message || error.message
        );
      }
    }
  };

  useEffect(() => {
    // Disable page refresh (beforeunload event)
    const handleBeforeUnload = (e) => {
      const message = "Are you sure you want to leave?";
      e.returnValue = message; // Standard for most browsers
      return message; // Some older browsers
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const resetForm = () => {
    setTestName("");
    setStartDate("");
    setEndDate("");
    setAuthOption("candidateInfo");
    setPassword("");
    setQuestions([]);
    setCandidates([]);
    setUpdatedCandidates([]);
    setShowDetails(false);
    sessionStorage.removeItem(`test-questions-${testId}`);
    localStorage.removeItem("candidates");
    localStorage.removeItem("questions");
    localStorage.removeItem("updatedCandidates");
  };

  const handleStartDateChange = (e) => {
    const localDate = e.target.value;
    setStartDate(localDate);
  };

  const handleEndDateChange = (e) => {
    const localDate = e.target.value;
    setEndDate(localDate);
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

  const groupedQuestions = questions.reduce((groups, question, idx) => {
    const { sector } = question; // Assuming each question has a 'sector' property
    if (!groups[sector]) {
      groups[sector] = [];
    }
    groups[sector].push({ ...question, originalIndex: idx }); // Store original index in question object
    return groups;
  }, {});

  // const handleDeleteQuestion = (index) => {
  //   const updatedQuestions = [...questions];
  //   updatedQuestions.splice(index, 1);
  //   setQuestions(updatedQuestions);
  //   console.log(`Question at index ${index} deleted.`);
  // };

  const handleDeleteQuestion = async (index) => {
    const questionId = questions[index]._id; // Ensure the _id is correct
    console.log(`Attempting to delete question with ID: ${questionId}`);

    try {
      // Send the delete request to the backend
      const response = await axios.delete(
        `http://localhost:20000/api/questions/${questionId}`
      );

      if (response.status === 200) {
        console.log(`Question with ID ${questionId} deleted from DB.`);

        // Update the UI after deletion
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);

        // Remove from sessionStorage
        sessionStorage.removeItem(`test-questions-${testId}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Question not found in DB, remove only from sessionStorage
        console.warn(
          `Question with ID ${questionId} not found in DB. Deleting from sessionStorage.`
        );

        // Update the UI
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);

        // Remove from sessionStorage
        sessionStorage.removeItem(`test-questions-${testId}`);
      } else {
        // Handle other errors
        console.error("Error deleting question from DB:", error);
      }
    }
  };

  const handleConfirmDelete = (sector, index) => {
    const question = groupedQuestions[sector][index];
    console.log("Original question ID:", question._id); // Add logging to confirm the correct questionId
    handleDeleteQuestion(question.originalIndex); // Make sure originalIndex is correct
  };

  type EditingQuestion = {
    options: string[]; // Ensure options is always a string array
    questionText?: string;
    correctAnswers: string[]; // correctAnswers should always be a string array
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

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all candidates
      setUpdatedCandidates([]);
      // Clear sessionStorage since no candidates are selected
      sessionStorage.setItem("updatedCandidates", JSON.stringify([]));
    } else {
      // Select all filtered candidates
      const allCandidateIds = filteredCandidates.map(
        (candidate: Candidate) => candidate._id
      );
      setUpdatedCandidates(allCandidateIds);
      // Update sessionStorage with all selected candidate IDs
      sessionStorage.setItem(
        "updatedCandidates",
        JSON.stringify(allCandidateIds)
      );
    }

    // Toggle selectAll state
    setSelectAll(!selectAll);
  };

  const filteredCandidates = candidates.filter((candidate: Candidate) => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.includes(query) ||
      candidate.name.includes(query) ||
      (candidate.dob && candidate.dob.includes(query))
    );
  });

  return (
    <>
      <div className="w-full py-6 px-7 flex justify-between items-start gap-5">
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
        <div className="max-w-[450px] min-w-[450px] overflow-y-scroll h-[calc(100vh-90px)] bg-[#a5c4ca] rounded-lg p-4">
          <h1 className="poppins2 text-[25px] text-[#083344]">Edit Test</h1>
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

          {/* Conditional Rendering Based on Authentication Option */}
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
                  <div>
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
                        <img className="w-7" src={SearchIcon} alt="" />
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
                        type="primary"
                        onClick={handleSelectAll}
                        style={{
                          backgroundColor: "#083344",
                          borderColor: "#083344",
                          color: "white",
                          marginLeft: "auto",
                        }}
                        href="#"
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

                  <div className="overflow-y-scroll">
                    {loading ? (
                      <div className="z-50 w-full h-full flex justify-center items-center">
                        <Spin size="large" className="custom-spin" />
                      </div>
                    ) : (
                      <List>
                        {filteredCandidates.map((candidate: Candidate) => (
                          <ListItem key={candidate._id} className="items-start">
                            <div
                              className={`w-full flex justify-start items-center -my-[6.5px] h-16 rounded-lg p-6 border-b-[1.5px] hover:bg-[#e7ebec] border-gray-200 cursor-pointer ${
                                updatedCandidates.includes(candidate._id)
                                  ? "bg-[#d9e5e7]"
                                  : ""
                              }`}
                              onClick={() =>
                                handleCandidateSelect(candidate._id)
                              }
                            >
                              <Checkbox
                                checked={updatedCandidates.includes(
                                  candidate._id
                                )}
                                onChange={() =>
                                  handleCandidateSelect(candidate._id)
                                }
                                style={{ display: "none" }}
                              />
                              <img
                                src={candidate.profilePicture || DefaultProfile}
                                alt={`${candidate.name}'s profile`}
                                className="w-10 h-10 bg-slate-400 p-2.5 rounded-lg mr-4"
                              />
                              <div className="flex flex-col justify-between items-start flex-grow">
                                <text className="poppins2 text-[15px] text-black">{`${candidate.name}`}</text>
                                <text className="montserrat text-[14px] text-gray-500">{`${
                                  candidate.email || "Email not available"
                                } - ${
                                  candidate.phone || "Phone not available"
                                }`}</text>
                              </div>
                              {updatedCandidates.includes(candidate._id) && (
                                <Button
                                  component="a"
                                  href="#"
                                  type="primary"
                                  style={{
                                    backgroundColor: "#083344",
                                    borderColor: "#083344",
                                    color: "white",
                                    marginLeft: "auto",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCandidateSelect(candidate._id);
                                  }}
                                >
                                  ✔
                                </Button>
                              )}
                            </div>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                </div>
              </Modal>
            </>
          )}

          <div className="mt-5">
            <AddQuestion questions={questions} setQuestions={setQuestions} />
          </div>

          <div className="flex justify-between items-center gap-5">
            <Button
              variant="contained"
              color="primary"
              onClick={resetForm}
              style={{
                width: "100%",
                marginBottom: "20px",
                marginTop: "20px",
                background: "#083344",
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
            <Button
              variant="contained"
              onClick={handleEditTest}
              style={{
                width: "100%",
                marginBottom: "20px",
                marginTop: "20px",
                background: "#ffffff",
              }}
            >
              <p
                className="poppins text-[15px] px-0.5 normal-case text-black"
                style={{
                  textDecorationThickness: "1.5px",
                  textUnderlineOffset: "2px",
                }}
              >
                Update Test
              </p>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTest;
