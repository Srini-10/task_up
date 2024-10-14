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
import { showToast } from "../toastUtil.js";
import { Form, Input, Modal, Select, Popconfirm, Spin } from "antd";

const { Option } = Select;

type Candidate = {
  profilePicture?: any;
  _id: never;
  registerNumber: string;
  dob: string;
  phone: string;
  email: string;
};

type Question = {
  questionText: string;
  inputType: string;
  options: string[];
  correctAnswerIndices: any[];
};
const EditTest = () => {
  const { testId } = useParams();
  const [viewQuestionIndex, setViewQuestionIndex] = useState(null);
  const [testName, setTestName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authOption, setAuthOption] = useState("candidateInfo");
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [questions, setQuestions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  console.log(showDetails);

  const [questionTypes] = useState([
    "Multiple Choice",
    "Select",
    "Radio",
    "Text Input",
  ]);

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

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://taskup-backend.vercel.app/api/testCandidates"
      );
      setCandidates(response.data);
      console.log(response.data);
      localStorage.setItem("candidates", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem("candidates")!);
    const storedSelectedCandidates = JSON.parse(
      localStorage.getItem("selectedCandidates")!
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
          `https://taskup-backend.vercel.app/api/tests/${testId}`
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
      } catch (error) {
        console.error("Error fetching test details:", error);
        showToast("An error occurred while fetching test details.");
      }
    };

    fetchTestDetails();
  }, [testId]);

  const handleViewQuestion = (index) => {
    setViewQuestionIndex(index);
    setIsViewModalOpen(true);
  };

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

  // Save candidates to local storage whenever candidates state is updated
  useEffect(() => {
    if (candidates.length > 0) {
      sessionStorage.setItem("candidates", JSON.stringify(candidates));
    }
  }, [candidates]);

  const handleEditTest = async () => {
    const selectedCandidateData = candidates
      .filter((candidate: Candidate) =>
        selectedCandidates.includes(candidate._id)
      )
      .map((candidate: Candidate) => ({
        registerNumber: candidate.registerNumber,
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
        correctAnswerIndices:
          q.correctAnswerIndices.length > 0 ? q.correctAnswerIndices : null,
      })),
      candidates: selectedCandidateData,
      malpractice: false,
    };

    try {
      await axios.put(
        `https://taskup-backend.vercel.app/api/tests/${testId}`,
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

  const handleStartDateChange = (e) => {
    const localDate = e.target.value;
    setStartDate(localDate); // Store local date for display in the input
  };

  const handleEndDateChange = (e) => {
    const localDate = e.target.value;
    setEndDate(localDate); // Store local date for display in the input
  };

  const handleEditQuestion = (index) => {
    setEditQuestionIndex(index);
    const questionToEdit = questions[index];
    //@ts-ignore
    setEditingQuestion({ ...questionToEdit, index });
    setIsEditModalOpen(true);
  };

  // Handle Saving the Edited Question
  const handleSaveEditedQuestion = () => {
    const updatedQuestions = [...questions];
    //@ts-ignore
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
      //@ts-ignore
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
      //@ts-ignore
      const newOptions = [...prev.options];
      newOptions[index] = value;
      //@ts-ignore
      return { ...prev, options: newOptions };
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(
        filteredCandidates.map((candidate: Candidate) => candidate._id)
      );
    }
    setSelectAll(!selectAll);
  };

  const filteredCandidates = candidates.filter((candidate: Candidate) => {
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
      <div className="w-full py-6 px-7 flex justify-between items-start gap-5">
        <div className="w-full min-h-full max-h-[calc(100vh-90px)] rounded-lg flex flex-col">
          <h1 className="poppins2 text-[23px] mb-1 text-[#083344]">
            Added Questions
          </h1>
          <div className="w-full h-full bg-slate-100 rounded-lg mt-3 p-4 pt-2 overflow-y-scroll">
            {isLoading ? (
              <div className="z-50 w-full h-full flex mt-2 justify-center items-center">
                <Spin size="large" className="custom-spin" />
              </div>
            ) : (
              questions.map((question, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start px-1 border-b-[1.5px] pb-3 border-cyan-900"
                >
                  <h1 className="mt-4 poppins text-[14px] overflow-hidden text-[#000000]">
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
              ))
            )}
          </div>

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
                  {questions[viewQuestionIndex].inputType !== "Text Input" ? (
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
                          questions[viewQuestionIndex].correctAnswerIndices.map(
                            (i) => (
                              <li className="list-disc" key={i}>
                                {questions[viewQuestionIndex].options[i]}
                              </li>
                            )
                          )
                        ) : (
                          <span>N/A</span>
                        )}
                      </p>
                    </>
                  ) : (
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
                    onChange={(e) => handleQuestionTextChange(e.target.value)}
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
                            {editingQuestion.options.map((option, index) => (
                              <Option key={index} value={index}>
                                {`${option}` || `Option ${index + 1}`}
                              </Option>
                            ))}
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
                            {editingQuestion.options.map((option, index) => (
                              <Option key={index} value={index}>
                                {`Option ${index + 1}: ${option}`}
                              </Option>
                            ))}
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
        </div>
        <div className="min-w-[450px] bg-[#a5c4ca] rounded-lg p-4">
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
                  )}
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
