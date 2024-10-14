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
import SearchIcon from "../assets/Search_Icon.svg";
import DefaultProfile from "../assets/User_Profile.svg";
import { Form, Input, Modal, Select, Popconfirm } from "antd";
import moment from "moment";
import { showToast } from "../toastUtil.js";

const { Option } = Select;

const Home = () => {
  const [viewQuestionIndex, setViewQuestionIndex] = useState(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
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
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [inputTypes, setInputTypes] = useState([]);
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
          "https://taskup-backend.vercel.app /api/inputTypes"
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
        "https://taskup-backend.vercel.app /api/testCandidates"
      );
      setCandidates(response.data);
      console.log(response.data);
      localStorage.setItem("candidates", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem("candidates"));
    const storedSelectedCandidates = JSON.parse(
      localStorage.getItem("selectedCandidates")
    );

    if (storedCandidates && storedCandidates.length > 0) {
      setCandidates(storedCandidates);
    } else {
      fetchCandidates();
    }

    if (storedSelectedCandidates) {
      setSelectedCandidates(storedSelectedCandidates);
    }
  }, []);

  // Store candidates and selectedCandidates in localStorage on change

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

    // Find the selected candidates by matching _id with selectedCandidates array
    const selectedCandidateData = candidates
      .filter((candidate) => selectedCandidates.includes(candidate._id))
      .map((candidate) => ({
        registerNumber: candidate.registerNumber,
        dob: candidate.dob,
        email: candidate.email,
        phone: candidate.phone,
      }));

    // Convert startDate and endDate to UTC before sending to backend
    const utcStartDate = new Date(startDate).toISOString();
    const utcEndDate = new Date(endDate).toISOString();

    const testData = {
      testName,
      startDate: utcStartDate,
      endDate: utcEndDate,
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
        "https://taskup-backend.vercel.app /api/tests",
        testData
      );
      console.log(response.data);
      showToast("Test created successfully!");
      resetForm();
    } catch (error) {
      showToast("An error occurred while creating the test.");
    } finally {
      setLoading(false);
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
        updatedSelected = prevSelected.filter((id) => id !== candidateId);
      } else {
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
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(
        filteredCandidates.map((candidate) => candidate._id)
      ); // Select all
    }
    setSelectAll(!selectAll);
  };

  const handleCorrectAnswerSelect = (selectedIndices) => {
    // Ensure correctAnswerIndices is an array
    setEditingQuestion((prev) => ({
      ...prev,
      correctAnswerIndices: Array.isArray(selectedIndices)
        ? selectedIndices
        : [selectedIndices],
    }));
  };

  const handleQuestionTextChange = (text) => {
    setEditingQuestion((prev) => ({ ...prev, questionText: text }));
  };

  const handleInputTypeChange = (newInputType) => {
    setEditingQuestion((prev) => ({
      ...prev,
      inputType: newInputType,
      correctAnswerIndices: [],
    }));
  };

  const handleOptionChange = (index, value) => {
    setEditingQuestion((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const handleViewQuestion = (index) => {
    setViewQuestionIndex(index);
    setIsViewModalOpen(true);
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

  // Handle Adding a new question
  const handleAddQuestion = (newQuestion) => {
    setQuestions([...questions, newQuestion]);
  };

  // Handle Editing a question
  const handleEditQuestion = (index) => {
    setEditQuestionIndex(index);
    const questionToEdit = questions[index];
    setEditingQuestion({ ...questionToEdit, index });
    setIsEditModalOpen(true);
  };

  // Handle Saving the Edited Question
  const handleSaveEditedQuestion = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestion.index] = { ...editingQuestion };
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

  const handleConfirmDelete = (index) => {
    handleDeleteQuestion(index);
  };

  const handleStartDateChange = (e) => {
    const localDate = e.target.value;
    setStartDate(localDate); // Store local date for display in the input
  };

  const handleEndDateChange = (e) => {
    const localDate = e.target.value;
    setEndDate(localDate); // Store local date for display in the input
  };

  // Filtering candidates based on search query
  const filteredCandidates = candidates.filter((candidate) => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.email.toLowerCase().includes(query) ||
      candidate.phone.includes(query) ||
      candidate.registerNumber.includes(query) ||
      (candidate.dob && candidate.dob.includes(query))
    );
  });

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

          <div className="">
            <h1 className="text-[20px] poppins2 text-[#083344]">
              Create Question
            </h1>
            <AddQuestion
              questions={questions}
              setQuestions={setQuestions}
              inputTypes={inputTypes}
              onAddQuestion={handleAddQuestion}
            />
          </div>

          {showDetails && (
            <>
              {questions.length > 0 ? (
                <>
                  <List>
                    <h1 className="poppins2 text-[20px] mb-1 text-[#083344]">
                      Added Questions
                    </h1>
                    {questions.map((question, index) => (
                      <>
                        <div
                          key={index}
                          className="flex justify-between items-start w-[400px] border-b-[1.5px] pb-2 border-gray-100"
                        >
                          <h1 className="mt-3 poppins text-[14px] overflow-hidden w-[330px] text-[#000000]">
                            {index + 1}.{question.questionText}
                          </h1>

                          <div className="gap-0.5 flex">
                            <IconButton
                              edge="end"
                              aria-label="view"
                              onClick={() => handleViewQuestion(index)}
                              className="w-[33px] h-[33px]"
                            >
                              <ion-icon name="eye" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEditQuestion(index)}
                              className="w-[33px] h-[33px]"
                            >
                              <ion-icon name="create-outline" />
                            </IconButton>
                            <Popconfirm
                              title="Are you sure to delete this question?"
                              onConfirm={() => handleConfirmDelete(index)}
                              okText="Yes"
                              cancelText="No"
                            >
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                className="w-[33px] h-[33px]"
                              >
                                <ion-icon name="trash-outline" />
                              </IconButton>
                            </Popconfirm>
                          </div>
                        </div>
                      </>
                    ))}
                  </List>
                </>
              ) : (
                <p className="text-gray-500 text-[15px]">
                  No questions added yet.
                </p>
              )}
              {/* View Question Modal */}
              <Modal open={isViewModalOpen} closable={false} footer={null}>
                <div>
                  <div className="w-full flex justify-end">
                    <button
                      className="underline text-[15px]"
                      onClick={handleCloseViewModal}
                    >
                      Close
                    </button>
                  </div>
                  {viewQuestionIndex !== null && (
                    <div className="mt-3">
                      {/* Question Title */}
                      <h1 className="poppins text-[16px] text-[#083344]">
                        {viewQuestionIndex + 1}.
                        {questions[viewQuestionIndex].questionText}
                      </h1>

                      {/* Question Type */}
                      <h1 className="mt-3 font-semibold">Question Type:</h1>
                      <p className="mt-1 w-full bg-[#dbe2e5] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                        {questions[viewQuestionIndex].inputType}
                      </p>

                      {/* Display Options and Correct Answers only when the question type is not 'Text Input' */}
                      {questions[viewQuestionIndex].inputType !==
                      "Text Input" ? (
                        <>
                          {/* Options */}
                          <h1 className="mt-3 font-semibold">Options:</h1>
                          <ul className="mt-1 w-full bg-[#dbe2e5] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                            {questions[viewQuestionIndex].options.map(
                              (option, index) => (
                                <li
                                  className="list-disc text-[#083344]"
                                  key={index}
                                >
                                  {option}
                                </li>
                              )
                            )}
                          </ul>

                          {/* Correct Answer */}
                          <h1 className="flex gap-2 mt-2 font-semibold justify-start">
                            Correct Answer:
                          </h1>
                          <p className="mt-1 w-full bg-[#dbe2e5] text-[#083344] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                            {questions[viewQuestionIndex].correctAnswerIndices
                              .length > 0 ? (
                              questions[
                                viewQuestionIndex
                              ].correctAnswerIndices.map((i) => (
                                <li className="list-disc" key={i}>
                                  {questions[viewQuestionIndex].options[i]}
                                </li>
                              ))
                            ) : (
                              <span>N/A</span>
                            )}
                          </p>
                        </>
                      ) : (
                        // Display message when the question type is 'Text Input'
                        <p className="mt-3 text-gray-600">
                          No options available for Text Input questions.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Modal>
              {editingQuestion && (
                <Modal
                  visible={isEditModalOpen}
                  closable={false}
                  onOk={handleSaveEditedQuestion}
                  footer={null}
                >
                  {editingQuestion && editQuestionIndex !== null && (
                    <div className="mt-1">
                      <h1 className="poppins2 text-[20px] text-[#083344]">
                        Question no.{editQuestionIndex + 1}
                      </h1>
                      <Input
                        placeholder="Question Text"
                        value={editingQuestion.questionText}
                        onChange={(e) =>
                          handleQuestionTextChange(e.target.value)
                        }
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        className="h-[40px] mt-2"
                      />
                      <Select
                        value={editingQuestion.inputType}
                        onChange={handleInputTypeChange}
                        style={{
                          width: "100%",
                          backgroundColor: "#ffffff",
                          borderRadius: "8px",
                          border: "0px solid #d1d5db",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        className="h-[40px] mt-2"
                      >
                        {questionTypes.map((type) => (
                          <Option key={type} value={type}>
                            {type}
                          </Option>
                        ))}
                      </Select>

                      {editingQuestion.inputType !== "Text Input" ? (
                        <div className="mt-4">
                          <h1 className="text-[16px] poppins text-[#083344]">
                            Options:
                          </h1>
                          {editingQuestion.options.map((option, index) => (
                            <Input
                              key={index}
                              placeholder={`Option ${index + 1}`}
                              style={{
                                width: "100%",
                                backgroundColor: "#ffffff",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                              className="h-[40px] my-1"
                              value={option}
                              onChange={(e) =>
                                handleOptionChange(index, e.target.value)
                              }
                              margin="normal"
                            />
                          ))}

                          {editingQuestion.inputType === "Multiple Choice" ? (
                            <Form.Item>
                              <h1 className="text-[16px] mt-4 poppins text-[#083344]">
                                Correct Answer:
                              </h1>
                              <Select
                                mode="multiple"
                                style={{
                                  width: "100%",
                                  backgroundColor: "#ffffff",
                                  borderRadius: "8px",
                                  border: "0px solid #d1d5db",
                                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                }}
                                className="h-[40px] mt-1"
                                value={editingQuestion.correctAnswerIndices}
                                onChange={(selectedIndices) =>
                                  handleCorrectAnswerSelect(selectedIndices)
                                }
                              >
                                {editingQuestion.options.map(
                                  (option, index) => (
                                    <Option key={index} value={index}>
                                      {`${option}` || `Option ${index + 1}`}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          ) : (
                            <Form.Item>
                              <Select
                                value={editingQuestion.correctAnswerIndices[0]}
                                onChange={(selectedIndex) =>
                                  handleCorrectAnswerSelect([selectedIndex])
                                }
                              >
                                {editingQuestion.options.map(
                                  (option, index) => (
                                    <Option key={index} value={index}>
                                      {`Option ${index + 1}: ${option}`}
                                    </Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          )}
                        </div>
                      ) : (
                        // Display message when the question type is 'Text Input'
                        <p className="mt-3 text-gray-600">
                          No options needed for Text Input questions.
                        </p>
                      )}

                      <div className="w-full flex justify-end gap-3">
                        <button
                          className="px-4 py-2 rounded-lg text-white font-semibold bg-[#8298a2]"
                          onClick={() => setIsEditModalOpen(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg text-white font-semibold bg-[#083344]"
                          onClick={handleSaveEditedQuestion}
                        >
                          Save Question
                        </button>
                      </div>
                    </div>
                  )}
                </Modal>
              )}
            </>
          )}

          <div className="w-full flex justify-between gap-3 items-center">
            <Button
              variant="contained"
              color="primary"
              onClick={resetForm}
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
