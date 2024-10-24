import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { styled } from "@mui/material/styles";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Spinner } from "@nextui-org/react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  Box,
  RadioProps,
} from "@mui/material";
import { showToast } from "../toastUtil.js";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import backgroundImage from "../assets/bg_image.jpg";
import DragIndicatorTwoToneIcon from "@mui/icons-material/DragIndicatorTwoTone";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import hexagonal from "../assets/hexagonal.svg";
import tick from "../assets/tick.svg";
import { Input, Switch } from "antd";
import Wave from "react-wavify";
// import DraggableCalculator from "./Calculator/DraggableCalculator.tsx";
import Calculator from "./Calculator/Calculator.tsx";
import SectorComponent from "./SectorComponent.tsx";
import QuestionsBySector from "./QuestionsBySector.tsx";

// type SelectedAnswers = {
//   [key: string]: number[] | number;
// };
interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswers: number[];
  required: boolean;
  inputType: "Text Input" | "Select" | "Radio" | "Multiple Choice";
}

const QuestionComponent: React.FC = () => {
  const [fullScreenMode, setFullScreenMode] = useState<boolean>(true);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const formRef = useRef(null);
  const { width, height } = useWindowSize();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sectors, setSectors] = useState([]);
  const [activeSector, setActiveSector] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState(false);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState<boolean>(false);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([0]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<string>("");
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setname] = useState("");
  const [dob, setDob] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [useEmailAuth, setUseEmailAuth] = useState(false);
  const [testName, setTestName] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const storedAnswers = sessionStorage.getItem("selectedAnswers");
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  });
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    // Retrieve the count from localStorage, or default to 0 if not found
    const storedCount = localStorage.getItem("tabSwitchCount");
    return storedCount ? parseInt(storedCount, 10) : 0;
  });
  const [malpractice, setMalpractice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const { testId } = useParams<{ testId: string }>();
  const [leftWidth, setLeftWidth] = useState(64);
  const isResizing = useRef(false);
  const navigate = useNavigate();
  const requestRef = useRef<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<any>(null);
  // const [isDrawing, setIsDrawing] = useState(false);
  // const [color] = useState("#000");
  // const [lineWidth] = useState(3);
  const [scale, setScale] = useState(1);
  const [offsetX] = useState(0);
  const [offsetY] = useState(0);

  console.log(malpractice, score, totalQuestions, tabSwitchCount);
  // Load bookmark state from sessionStorage when the component mounts
  useEffect(() => {
    const storedBookmarkState = sessionStorage.getItem("isBookmarked");
    if (storedBookmarkState !== null) {
      setIsBookmarked(JSON.parse(storedBookmarkState));
    }
  }, []);

  // Toggle bookmark state and store in sessionStorage
  const handleBookmarkClick = () => {
    setIsBookmarked((prev) => {
      const newBookmarkState = !prev;
      sessionStorage.setItem("isBookmarked", JSON.stringify(newBookmarkState));
      return newBookmarkState;
    });
  };

  // Initialize canvas
  // const startDrawing = (e) => {
  //   setIsDrawing(true);
  //   const canvas = canvasRef.current;
  //   ctxRef.current = canvas!.getContext("2d");

  //   // Set stroke style and width
  //   ctxRef.current.strokeStyle = color;
  //   ctxRef.current.lineWidth = lineWidth;
  //   ctxRef.current.lineCap = "round";

  //   ctxRef.current.beginPath();
  //   ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  // };

  // const draw = (e) => {
  //   if (!isDrawing) return;
  //   ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  //   ctxRef.current.stroke();
  // };

  // const stopDrawing = () => {
  //   if (ctxRef.current) {
  //     setIsDrawing(false);
  //     ctxRef.current.closePath();
  //   }
  // };

  // Clear canvas function
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (ctx) {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    }
  };

  // Redraw the canvas with the current scale
  const redrawCanvas = useCallback(
    (newScale) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      if (canvas && ctx) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(newScale, 0, 0, newScale, offsetX, offsetY);
        ctx.putImageData(imgData, 0, 0);
      }
    },
    [offsetX, offsetY, canvasRef, ctxRef]
  );

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const newScale = scale + e.deltaY * -0.001;
      setScale(Math.min(Math.max(newScale, 0.5), 3));
      redrawCanvas(newScale);
    },
    //@ts-ignore
    [scale, redrawCanvas]
  );

  // Set up event listener for the canvas
  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener("wheel", handleWheel);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  // Mouse down event handler for starting resize
  const handleMouseDown = () => {
    isResizing.current = true;
  };

  // Optimized Mouse move event handler using requestAnimationFrame
  const handleMouseMove = useCallback(
    (e) => {
      if (isResizing.current) {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
        requestRef.current = requestAnimationFrame(() => {
          const newLeftWidth = (e.clientX / window.innerWidth) * 100;
          setLeftWidth(newLeftWidth);
        });
      }
    },
    [] // If there are no dependencies, pass an empty array
  );

  // Mouse up event handler for stopping resize
  const handleMouseUp = () => {
    isResizing.current = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  // Attach global mouse events when resizing
  React.useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  // Function to calculate time difference
  const calculateTimeDifference = (targetTime: Date) => {
    const now = new Date().getTime();
    const difference = targetTime.getTime() - now;
    return Math.max(difference, 0);
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (testStatus === "ongoing" && startTime && endTime) {
      // Set initial remaining time for ongoing tests
      setRemainingTime(calculateTimeDifference(endTime));

      // Countdown for the ongoing test
      intervalId = setInterval(() => {
        const timeUntilEnd = calculateTimeDifference(endTime);
        setRemainingTime(timeUntilEnd);
        if (timeUntilEnd <= 0) {
          setTestStatus("ended");
          clearInterval(intervalId);
        }
      }, 1000);
    } else if (testStatus === "before" && startTime) {
      // Countdown to start time for upcoming tests
      intervalId = setInterval(() => {
        const timeUntilStart = calculateTimeDifference(startTime);
        setRemainingTime(timeUntilStart);
        if (timeUntilStart <= 0) {
          setTestStatus("ongoing");
          clearInterval(intervalId);
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [testStatus, startTime, endTime]);

  // Format time (milliseconds to HH:MM:SS)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Update `remainingTime` when testStatus transitions to "ongoing"
  useEffect(() => {
    if (testStatus === "ongoing" && endTime) {
      setRemainingTime(calculateTimeDifference(endTime));
    }
  }, [testStatus, endTime]);

  // Validation function to check if all required questions are answered
  const checkIfAllRequiredQuestionsAnswered = () => {
    return questions.every((question) => {
      if (question.required) {
        const answer = selectedAnswers[question._id];
        // Check if the answer exists and is valid (non-empty)
        return answer !== undefined && answer !== null && answer !== "";
      }
      return true; // Non-required questions don't need to be answered
    });
  };

  // Update submit button disabled state based on required questions validation
  useEffect(() => {
    const allRequiredAnswered = checkIfAllRequiredQuestionsAnswered();
    setIsSubmitDisabled(!allRequiredAnswered); // Disable if not all are answered
  }, [questions, selectedAnswers]);

  useEffect(() => {
    // Check if the test has ended and auto submit if it hasn't already been submitted
    if (testStatus === "ended" && !isAutoSubmitted && !isTestSubmitted) {
      handleMalpracticeSubmit();
    }
  }, [testStatus, isAutoSubmitted, isTestSubmitted]);

  const handleMalpracticeSubmit = useCallback(
    async (
      event: React.FormEvent<HTMLFormElement> | null = null,
      isMalpractice = false
    ) => {
      if (event) event.preventDefault();

      setSubmitLoading(true);

      setIsAutoSubmitted(true);

      // Retrieve authentication data from session storage
      const authData = JSON.parse(sessionStorage.getItem("authData") || "{}");
      const { email, name, phone, dob } = authData;

      if (!email || !name) {
        showToast("Authentication details not available. Please login again.");
        setSubmitLoading(false);
        return;
      }

      try {
        console.log("Submitting selectedAnswers:", selectedAnswers);
        // Prepare answers array
        const answers = Object.entries(selectedAnswers).map(
          ([questionId, selectedAnswer]) => {
            const question = questions.find((q) => q._id === questionId);
            return {
              questionId,
              questionText: question?.questionText,
              selectedAnswer: Array.isArray(selectedAnswer)
                ? selectedAnswer.map(Number)
                : Number(selectedAnswer),
            };
          }
        );

        // Prepare questions array (full question details)
        const fullQuestions = questions.map((question) => ({
          _id: question._id,
          questionText: question.questionText,
          options: question.options,
          correctAnswers: question.correctAnswers,
        }));

        // Submit answers and get the score
        const submissionResponse = await axios.post(
          `http://localhost:20000/api/tests/${testId}/submit`,
          {
            email,
            name,
            phone,
            dob,
            answers,
            malpractice: isMalpractice,
          }
        );

        const { score, totalQuestions } = submissionResponse.data;
        setScore(score);
        setTotalQuestions(totalQuestions);

        // Save the submission with both questions and answers
        const saveSubmissionPayload = {
          testId,
          email,
          name,
          phone,
          dob,
          questions: fullQuestions,
          answers,
          score,
          malpractice: isMalpractice,
        };

        // Save the submission to the database
        await axios.post(
          `http://localhost:20000/api/tests/${testId}/save-submission`,
          saveSubmissionPayload
        );

        setIsSubmissionSuccessful(true);

        console.log("Response from server:", answers);

        localStorage.removeItem("tabSwitchCount");
        // Store submission status in localStorage
        localStorage.setItem("isTestSubmitted", "true");
        localStorage.setItem("isSubmissionSuccessful", "true");
        sessionStorage.setItem("score", score.toString());
        sessionStorage.setItem("totalQuestions", totalQuestions.toString());
      } catch (error) {
        console.error("Error during submission:", error);
        showToast(
          "An error occurred during submission: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [
      questions,
      selectedAnswers,
      testId,
      setScore,
      setTotalQuestions,
      setIsSubmissionSuccessful,
    ]
  );

  const handleSubmit = useCallback(
    async (
      event: React.FormEvent<HTMLFormElement> | null = null,
      isMalpractice = false
    ) => {
      if (event) event.preventDefault();

      // Prevent submission if there are unanswered required questions
      if (isSubmitDisabled) {
        showToast("Please answer all required questions before submitting.");
        return;
      }

      setSubmitLoading(true);

      // Retrieve authentication data from session storage
      const authData = JSON.parse(sessionStorage.getItem("authData") || "{}");
      const { email, name, phone, dob } = authData;

      if (!email || !name) {
        showToast("Authentication details not available. Please login again.");
        setSubmitLoading(false);
        return;
      }

      try {
        console.log("Submitting selectedAnswers:", selectedAnswers);
        // Prepare answers array
        const answers = Object.entries(selectedAnswers).map(
          ([questionId, selectedAnswer]) => {
            const question = questions.find((q) => q._id === questionId);
            return {
              questionId,
              questionText: question?.questionText,
              selectedAnswer: Array.isArray(selectedAnswer)
                ? selectedAnswer.map(Number)
                : Number(selectedAnswer),
            };
          }
        );

        // Prepare questions array (full question details)
        const fullQuestions = questions.map((question) => ({
          _id: question._id,
          questionText: question.questionText,
          options: question.options,
          correctAnswers: question.correctAnswers,
          required: question.required,
        }));

        // Submit answers and get the score
        const submissionResponse = await axios.post(
          `http://localhost:20000/api/tests/${testId}/submit`,
          {
            email,
            name,
            phone,
            dob,
            answers,
            malpractice: isMalpractice,
          }
        );

        const { score, totalQuestions } = submissionResponse.data;
        setScore(score);
        setTotalQuestions(totalQuestions);

        // Save the submission with both questions and answers
        const saveSubmissionPayload = {
          testId,
          email,
          name,
          phone,
          dob,
          questions: fullQuestions,
          answers,
          score,
          malpractice: isMalpractice,
        };

        // Save the submission to the database
        await axios.post(
          `http://localhost:20000/api/tests/${testId}/save-submission`,
          saveSubmissionPayload
        );

        setIsSubmissionSuccessful(true);

        console.log("Response from server:", answers);

        localStorage.removeItem("tabSwitchCount");
        // Store submission status in localStorage
        localStorage.setItem("isTestSubmitted", "true");
        localStorage.setItem("isSubmissionSuccessful", "true");
        sessionStorage.setItem("score", score.toString());
        sessionStorage.setItem("totalQuestions", totalQuestions.toString());
      } catch (error) {
        console.error("Error during submission:", error);
        showToast(
          "An error occurred during submission: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [
      questions,
      selectedAnswers,
      testId,
      setScore,
      setTotalQuestions,
      setIsSubmissionSuccessful,
      isSubmitDisabled,
    ]
  );

  // Tab visibility change listener
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden") {
      setTabSwitchCount((prevCount) => {
        const newCount = prevCount + 1;

        // Save the updated count in sessionStorage as a string
        // localStorage.setItem("tabSwitchCount", newCount.toString());

        if (newCount > 300) {
          showToast(
            "You have switched tabs too many times. Your test will be submitted automatically."
          );
          setMalpractice(true);
          handleMalpracticeSubmit(); // This is the dependency that should be added
        } else {
          showToast(
            `Switched tab ${newCount} time. You can switch ${
              3 - newCount
            } more time.`
          );
        }
        return newCount;
      });
    }
  }, [handleMalpracticeSubmit]);

  useEffect(() => {
    if (
      (isAuthenticated && !isTestSubmitted && testStatus === "ended") ||
      testStatus === "before"
    ) {
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [isAuthenticated, handleVisibilityChange, isTestSubmitted, testStatus]);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:20000/api/tests/${testId}`
        );
        const test = response.data;

        console.log(response.data);

        // Convert the fetched `startDate` and `endDate` to Date objects
        const fetchedStartTime = new Date(test.startDate);
        const fetchedEndTime = new Date(test.endDate);

        setStartTime(fetchedStartTime);
        setEndTime(fetchedEndTime);

        // Check the current time against the start and end times
        const now = new Date();
        if (now < fetchedStartTime) {
          setTestStatus("before");
        } else if (now >= fetchedStartTime && now <= fetchedEndTime) {
          setTestStatus("ongoing");
        } else {
          setTestStatus("ended");
        }
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    };

    fetchTestData();
  }, [testId]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:20000/api/tests/${testId}/questions`
      );
      setQuestions(response.data);

      // Extract unique sectors from the fetched questions
      const uniqueSectors = [
        ...new Set(response.data.map((question) => question.sector)),
      ];
      setSectors(uniqueSectors);

      console.log(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const handleSectorClick = (sector) => {
    setActiveSector(sector);

    // Filter questions that belong to the selected sector
    const sectorQuestions = questions.filter(
      (question) => question.sector === sector
    );
    setFilteredQuestions(sectorQuestions);

    // Display the first question of the selected sector
    if (sectorQuestions.length > 0) {
      setSelectedQuestion(sectorQuestions[0]);
    }
  };

  // Check if user is already authenticated and load submission status from sessionStorage
  useEffect(() => {
    // Load stored input values from sessionStorage
    const storedTestName = sessionStorage.getItem("testName");
    const storedname = sessionStorage.getItem("name");
    const storedDob = sessionStorage.getItem("dob");
    const storedEmail = sessionStorage.getItem("email");
    const storedPhone = sessionStorage.getItem("phone");

    if (storedTestName) setTestName(storedTestName);
    if (storedname) setname(storedname);
    if (storedDob) setDob(storedDob);
    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);

    const storedSelectedAnswers = JSON.parse(
      sessionStorage.getItem("selectedAnswers") || "{}"
    );
    setSelectedAnswers(storedSelectedAnswers);

    // Check if a submission exists in local storage or the backend
    const checkStoredSubmission = (storedSubmission: string | null) => {
      const storedScore = sessionStorage.getItem("score");
      const storedTotalQuestions = sessionStorage.getItem("totalQuestions");

      // If the test has already been submitted
      if (storedSubmission === "true") {
        setIsTestSubmitted(true);

        // If score and totalQuestions are stored in session storage, set them
        if (storedScore && storedTotalQuestions) {
          setScore(parseInt(storedScore));
          setTotalQuestions(parseInt(storedTotalQuestions));
        } else {
          fetchQuestions();
        }
      } else {
        fetchQuestions();
      }
    };

    // Check if user is already authenticated and load submission status from sessionStorage
    const storedAuthData = sessionStorage.getItem("authData");
    const storedSubmission = localStorage.getItem("isTestSubmitted");
    if (storedAuthData) {
      const authData = JSON.parse(storedAuthData);
      if (authData.testId === testId) {
        setIsAuthenticated(true);
        checkStoredSubmission(storedSubmission);
        setTestName(authData.testName);
      }
    }
  }, [testId, fetchQuestions]);

  // Store input field values in sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("testName", testName);
    sessionStorage.setItem("name", name);
    sessionStorage.setItem("dob", dob);
    sessionStorage.setItem("email", email);
    sessionStorage.setItem("phone", phone);
  }, [testName, name, dob, email, phone]);

  // Store selected answers in sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  // Check if user has already submitted the test
  const checkTestSubmission = async (email: string, name: string) => {
    try {
      const response = await axios.post(
        `http://localhost:20000/api/tests/${testId}/check-submission`,
        { email, name }
      );

      console.log("API response:", response.data);

      if (response.data.submitted) {
        console.log("Test was already submitted.");

        // Set test submitted state and scores
        setIsTestSubmitted(true);
        setScore(response.data.score);
        setTotalQuestions(response.data.totalQuestions);

        // Store submission status in localStorage
        localStorage.setItem("isTestSubmitted", "true");

        // Save to sessionStorage
        sessionStorage.setItem("score", response.data.score.toString());
        sessionStorage.setItem(
          "totalQuestions",
          response.data.totalQuestions.toString()
        );
      } else {
        console.log("Test not submitted yet.");

        // User has not submitted the test
        setIsAuthenticated(true);
        fetchQuestions();
      }
    } catch (error) {
      console.error("Error checking test submission:", error);
      showToast("An error occurred while checking your submission.");
    }
  };

  useEffect(() => {
    // Assume this fetches the test name based on testId
    const fetchTestName = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:20000/api/tests/${testId}`
        );
        setTestName(response.data.testName);
      } catch (error) {
        console.error("Error fetching test name:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestName();
  }, [testId]);

  // Authentication handler
  const handleAuthentication = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:20000/api/tests/${testId}/authenticate`,
        { name, dob, email, phone }
      );

      if (response.data.useEmailAuth) {
        setUseEmailAuth(true);
      } else {
        // Store authentication data in session storage
        sessionStorage.setItem(
          "authData",
          JSON.stringify({
            testId,
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            dob: response.data.dob,
          })
        );

        // Call checkTestSubmission to verify test status
        await checkTestSubmission(response.data.email, response.data.name);

        // Update isAuthenticated state to true
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedSubmission = sessionStorage.getItem("isTestSubmitted");
    const storedScore = sessionStorage.getItem("testScore");
    if (storedSubmission === "true") {
      setIsTestSubmitted(true);
    }
    if (storedScore) {
      setScore(JSON.parse(storedScore));
    }
  }, []);

  const handleAuthError = (error: any) => {
    if (error.response) {
      console.error("Authentication failed:", error.response.data);
      showToast(
        "Authentication failed: " +
          (error.response.status === 401
            ? error.response.statusText
            : "Incorrect credentials.")
      );
    } else if (error.request) {
      console.error("No response from server:", error.request);
      showToast("Authentication failed: No response from the server.");
    } else {
      console.error("Error in setting up request:", error.message);
      showToast("Authentication failed: An unexpected error occurred.");
    }
  };

  const handleInputChange = (
    questionId: string,
    answer: number | string | number[]
  ) => {
    console.log("Updating questionId:", questionId, "with answer:", answer);

    // Ensure answer is an array, even for single answers
    const formattedAnswer = Array.isArray(answer) ? answer : [answer];

    // Update selectedAnswers for the specific questionId
    setSelectedAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [questionId]: formattedAnswer, // Store the answer in array format
      };
      console.log("Updated selectedAnswers:", updatedAnswers);
      return updatedAnswers;
    });
  };

  // For Single Answer Inputs like Radio and Select
  const handleSingleAnswerChange = (questionId: string, answer: any) => {
    handleInputChange(questionId, [answer]); // Wrap the single answer in an array
  };

  // For Multiple Choice Inputs like Checkboxes
  const handleMultipleChoiceChange = (
    questionId: string,
    index: number,
    isChecked: boolean
  ) => {
    const currentAnswers = selectedAnswers[questionId] || []; // Get current answers or an empty array
    const newAnswers = isChecked
      ? [...currentAnswers, index] // Add index if checked
      : currentAnswers.filter((ans: number) => ans !== index); // Remove if unchecked
    handleInputChange(questionId, newAnswers); // Update answers in array format
  };

  useEffect(() => {
    // Save to sessionStorage whenever selectedAnswers changes
    sessionStorage.setItem("selectedAnswers", JSON.stringify(selectedAnswers));
  }, [selectedAnswers]);

  useEffect(() => {
    // Check sessionStorage for submission status
    const submissionStatus = sessionStorage.getItem("isSubmissionSuccessful");
    const savedScore = sessionStorage.getItem("score");
    const savedTotalQuestions = sessionStorage.getItem("totalQuestions");

    if (submissionStatus === "true" && savedScore && savedTotalQuestions) {
      setIsSubmissionSuccessful(true);
      setScore(Number(savedScore));
      setTotalQuestions(Number(savedTotalQuestions));
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authData");
    sessionStorage.removeItem("selectedAnswers");
    sessionStorage.removeItem("testScore");
    sessionStorage.removeItem("totalQuestions");
    sessionStorage.removeItem("isSubmissionSuccessful");
    localStorage.removeItem("isTestSubmitted");
    setTestName("");
    setname("");
    setDob("");
    setEmail("");
    setPhone("");

    // Reset component state
    setIsAuthenticated(false);
    setIsTestSubmitted(false);
    // Navigate to the test page
    navigate(`/tests/${testId}/`);

    // Force a reload of the page to ensure the state is properly updated
    window.location.reload();
  };

  // Retrieve the selected question index from session storage on component mount
  useEffect(() => {
    const savedIndex = sessionStorage.getItem("selectedQuestionIndex");
    if (savedIndex) {
      setSelectedIndexes([parseInt(savedIndex)]);
    }
  }, []);

  // Handle box click (selecting the box)
  const handleBoxClick = (index: number) => {
    setSelectedIndexes([index]);
    sessionStorage.setItem("selectedQuestionIndex", index.toString());
  };

  // Handle navigation to the previous question
  const handlePrevious = useCallback(() => {
    if (selectedIndexes[0] > 0) {
      const newIndex = selectedIndexes[0] - 1;
      setSelectedIndexes([selectedIndexes[0] - 1]);
      sessionStorage.setItem("selectedQuestionIndex", newIndex.toString());
    }
  }, [selectedIndexes]);

  // Handle navigation to the next question
  const handleNext = useCallback(() => {
    if (selectedIndexes[0] < questions.length - 1) {
      const newIndex = selectedIndexes[0] + 1;
      setSelectedIndexes([selectedIndexes[0] + 1]);
      sessionStorage.setItem("selectedQuestionIndex", newIndex.toString());
    }
  }, [selectedIndexes, questions.length]);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        console.log("Escape key pressed but disabled.");
      }
      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    },
    [handlePrevious, handleNext]
  );

  // Use effect to set up and clean up the keydown event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Calculate the progress based on answered questions (using selectedAnswers)
  const answeredQuestions = questions.filter(
    (question) => selectedAnswers[question._id]
  );
  const percentage = (answeredQuestions.length / questions.length) * 100;

  const toggleFullScreen = () => {
    if (!fullScreenMode) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          console.log("Entered full-screen mode");
          sessionStorage.setItem("isFullScreen", "true");
          setFullScreenMode(true);
        })
        .catch((err) => {
          console.error(
            `Error attempting to enter full-screen mode: ${err.message} (${err.name})`
          );
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          console.log("Exited full-screen mode");
          sessionStorage.setItem("isFullScreen", "false");
          setFullScreenMode(false);
        })
        .catch((err) => {
          console.error(
            `Error attempting to exit full-screen mode: ${err.message} (${err.name})`
          );
        });
    }
  };

  // Effect to handle full-screen state on page load
  useEffect(() => {
    if (fullScreenMode) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enter full-screen mode: ${err.message} (${err.name})`
        );
      });
    }

    const isFullScreen = () => {
      return document.fullscreenElement !== null;
    };

    // Check initial full-screen state
    setFullScreenMode(isFullScreen());

    // Listen for changes in full-screen mode
    const handleFullScreenChange = () => {
      setFullScreenMode(isFullScreen());
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    // Cleanup listener on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, [fullScreenMode]);

  // Function to trigger form submission from external button
  const triggerFormSubmit = () => {
    handleSubmit();
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

  useEffect(() => {
    // Retrieve the submission success status from localStorage when the component mounts
    const isTestSubmitted = localStorage.getItem("isTestSubmitted") === "true";
    const isSubmissionSuccessful =
      localStorage.getItem("isSubmissionSuccessful") === "true";

    if (isTestSubmitted && isSubmissionSuccessful) {
      setIsSubmissionSuccessful(true);
    }
  }, []);

  // Check for stored score on refresh
  useEffect(() => {
    const storedSubmission = localStorage.getItem("isTestSubmitted");
    const storedScore = sessionStorage.getItem("testScore");
    if (storedSubmission === "true") {
      setIsTestSubmitted(true);
    }
    if (storedScore) {
      setScore(JSON.parse(storedScore));
    }
  }, []);

  // document.addEventListener("contextmenu", (e) => e.preventDefault());

  // document.addEventListener("keydown", function (e) {
  //   // Disable F12
  //   if (e.keyCode === 123) {
  //     e.preventDefault();
  //   }
  //   // Disable Ctrl+Shift+I (for inspecting the page)
  //   if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
  //     e.preventDefault();
  //   }
  //   // Disable Ctrl+U (View Source)
  //   if (e.ctrlKey && e.keyCode === 85) {
  //     e.preventDefault();
  //   }
  // });

  const splitText = (text) => {
    const patterns = [
      { regex: /`\*{([^%]+)}\*`/g, type: "code" },
      { regex: /\*\*([^*]+)\*\*/g, type: "bold" },
    ];

    const parts = [];
    let lastIndex = 0;

    patterns.forEach(({ regex, type }) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        // Push text before the matched pattern
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: text.slice(lastIndex, match.index),
          });
        }

        // Push the matched part based on its type (e.g., bold)
        parts.push({ type, content: match[1] });

        lastIndex = regex.lastIndex;
      }
    });

    // Push any remaining text after the last match
    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.slice(lastIndex) });
    }

    return parts;
  };

  const BpRadioIcon = styled("span")(({ theme }) => ({
    borderRadius: "50%",
    width: 18,
    height: 18,
    boxShadow:
      "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundColor: "#e2e8f0",
    backgroundImage: "linear-gradient(180deg,#e2e8f0,hsla(0,0%,100%,0))",
    ".Mui-focusVisible &": {
      outline: "2px auto rgba(19,124,189,.6)",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#e2e8f0",
      ...theme.applyStyles("nightOwl", {
        backgroundColor: "#083344",
      }),
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "rgba(206,217,224,.5)",
      ...theme.applyStyles("nightOwl", {
        background: "#083344",
      }),
    },
    ...theme.applyStyles("nightOwl", {
      boxShadow: "0 0 0 1px rgb(16 22 26 / 40%)",
      backgroundColor: "#083344",
      backgroundImage:
        "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))",
    }),
  }));

  const BpRadioCheckedIcon = styled(BpRadioIcon)({
    backgroundColor: "#083344",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
    "&::before": {
      display: "block",
      width: 18,
      height: 18,
      backgroundImage: "radial-gradient(#e2e8f0,#e2e8f0 28%,transparent 32%)",
      content: '""',
    },
    "input:hover ~ &": {
      backgroundColor: "#083344",
    },
  });

  const BpIcon = styled("span")(({ theme }) => ({
    borderRadius: 3,
    width: 18,
    height: 18,
    boxShadow:
      "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
    backgroundColor: "#e2e8f0",
    backgroundImage: "linear-gradient(180deg,#e2e8f0,hsla(0,0%,100%,0))",
    ".Mui-focusVisible &": {
      outline: "2px auto #083344",
      outlineOffset: 2,
    },
    "input:hover ~ &": {
      backgroundColor: "#e2e8f0",
      ...theme.applyStyles("nightOwl", {
        backgroundColor: "#083344",
      }),
    },
    "input:disabled ~ &": {
      boxShadow: "none",
      background: "#e2e8f0",
      ...theme.applyStyles("nightOwl", {
        background: "#083344",
      }),
    },
    ...theme.applyStyles("nightOwl", {
      boxShadow: "0 0 0 1px rgb(16 22 26 / 40%)",
      backgroundColor: "#083344",
      backgroundImage:
        "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))",
    }),
  }));

  const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: "#083344",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
    "&::before": {
      display: "block",
      width: 18,
      height: 18,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
    "input:hover ~ &": {
      backgroundColor: "#e2e8f0",
    },
  });

  // Inspired by blueprintjs
  function BpRadio(props: RadioProps) {
    return (
      <Radio
        disableRipple
        color="default"
        checkedIcon={<BpRadioCheckedIcon />}
        icon={<BpRadioIcon />}
        {...props}
      />
    );
  }

  // Inspired by blueprintjs
  function BpCheckbox(props: CheckboxProps) {
    return (
      <Checkbox
        sx={{ "&:hover": { bgcolor: "transparent" } }}
        disableRipple
        color="default"
        checkedIcon={<BpCheckedIcon />}
        icon={<BpIcon />}
        inputProps={{ "aria-label": "Checkbox demo" }}
        {...props}
      />
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Spinner size="lg" color="default" />
      </div>
    );
  }

  if (isTestSubmitted || isSubmissionSuccessful) {
    return (
      <div>
        {testStatus === "ended" ? (
          <div className="w-full h-screen flex text-center items-center justify-center">
            <p className="text-[30px] font-bold">Test was ended.</p>
          </div>
        ) : (
          <>
            <div className="w-full h-screen flex flex-col items-center bg-[#e2ecef] justify-center pb-[7vh]">
              <Confetti width={width} height={height} recycle={false} />
              <div className="text-center">
                <div className="items-center justify-center flex">
                  <img
                    src={hexagonal}
                    alt=""
                    className="relative h-[100px] mx-auto"
                  />
                  <img
                    src={tick}
                    alt=""
                    className="absolute h-[45px] mx-auto"
                  />
                </div>
                <p className="poppins text-gray-400 mt-4 text-[26px] font-medium">
                  Amazing!
                </p>
                <h1 className="text-[40px] font-medium">
                  {isTestSubmitted
                    ? "You've already submitted your test."
                    : "Congratulations. You've completed the test!"}
                </h1>
                {/* {score !== null && totalQuestions !== null ? (
                  <p>
                    Your score: {score} out of {totalQuestions}
                  </p>
                ) : (
                  <p>Loading your score...</p>
                )} */}
                <button
                  className="mt-4 font-semibold flex mx-auto items-center bg-[#ffffff] hover:shadow-lg transition ease-in-out duration-500 p-3 rounded-lg gap-1 text-gray-400"
                  onClick={handleLogout}
                >
                  LOGIN<p className="text-black">ANOTHER CANDIDATE</p>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="">
        {testStatus === "before" && (
          <>
            <a href="/">
              <button className="poppins absolute top-2 left-2 text-[#083344] font-medium">
                Go Back
              </button>
            </a>
            <div className="w-full h-screen flex text-center items-center bg-[#e2ecef] justify-center">
              <p className="text-[35px] flex gap-1.5 items-center font-bold text-[#083344]">
                Test will start in:
                <p className="text-[38px] poppins2 text-[#216578]">
                  {formatTime(remainingTime || 0)}
                </p>
              </p>
            </div>
          </>
        )}
        {testStatus === "ended" && (
          <>
            <a href="/">
              <button className="poppins absolute top-2 left-2 text-[#083344] font-medium">
                Go Back
              </button>
            </a>
            <div className="w-full h-screen flex text-center bg-[#e2ecef] items-center justify-center">
              <p className="text-[35px] font-bold text-[#083546]">
                The test has been completed!
              </p>
            </div>
          </>
        )}
        {testStatus === "ongoing" && (
          <>
            {!isAuthenticated ? (
              <div>
                <div className="h-screen w-full items-center justify-center flex">
                  <div className="w-full poppins absolute top-2 justify-between flex px-2.5 text-[#083344] font-medium">
                    <a href="/">
                      <button className="">Go Back</button>
                    </a>
                    {remainingTime !== null && (
                      <h2 className="flex gap-2">
                        Test will end within:{" "}
                        <p className="font-semibold text-[#216578]">
                          {formatTime(remainingTime)}
                        </p>
                      </h2>
                    )}
                  </div>
                  <div className="">
                    <div className="flex items-center justify-center -mt-10 w-[70vw]">
                      {testName && (
                        <h2 className="poppins2 text-[27px] text-black font-semibold">
                          {testName}
                        </h2>
                      )}
                    </div>
                    <form
                      onSubmit={handleAuthentication}
                      className="flex w-[430px] mx-auto flex-col items-center mt-8 gap-3 justify-between"
                    >
                      {!useEmailAuth ? (
                        <>
                          <h1 className="poppins text-[14px] -mt-6 mb-6 text-[#818181]">
                            Enter you email and mobile number to start the test
                          </h1>
                          <Input
                            allowClear
                            type="text"
                            placeholder="Enter your email"
                            className="w-full h-12 text-[15px] font-medium rounded-lg border-none focus:outline-none"
                            style={{
                              backgroundColor: "#e2e8f0",
                              border: "none",
                              boxShadow: "none",
                            }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                          <Input
                            allowClear
                            type="text"
                            placeholder="Enter your number"
                            className="w-full h-12 text-[15px] font-medium rounded-lg border-none focus:outline-none"
                            style={{
                              backgroundColor: "#e2e8f0",
                              border: "none",
                              boxShadow: "none",
                            }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </>
                      ) : (
                        <>
                          <h1 className="poppins text-[14px] -mt-6 mb-6 text-[#818181]">
                            Enter you register number and DOB to start the test
                          </h1>
                          <Input
                            allowClear
                            type="text"
                            placeholder="Register number"
                            className="w-full h-12 text-[15px] font-medium rounded-lg border-none focus:outline-none"
                            style={{
                              backgroundColor: "#e2e8f0",
                              border: "none",
                              boxShadow: "none",
                            }}
                            value={name}
                            onChange={(e) => setname(e.target.value)}
                            required
                          />
                          <Input
                            allowClear
                            type="text"
                            placeholder="Date of birth"
                            className="w-full h-12 text-[15px] font-medium rounded-lg border-none focus:outline-none"
                            style={{
                              backgroundColor: "#e2e8f0",
                              border: "none",
                              boxShadow: "none",
                            }}
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            required
                          />
                        </>
                      )}

                      <button
                        type="button"
                        className="font-semibold w-full flex items-center text-[#216578] p-3 rounded-lg gap-1"
                        onClick={() => setUseEmailAuth(!useEmailAuth)}
                      >
                        <p className="flex justify-start text-[13px] gap-2">
                          {" "}
                          Don't have{" "}
                          {useEmailAuth ? "register number?" : "email?"}
                          <span className="text-[#98a0a1]">
                            {useEmailAuth
                              ? "Use Email Id"
                              : "Use Register number"}
                          </span>
                        </p>
                      </button>
                      <button
                        type="submit"
                        className="mt-1 font-semibold w-full text-[#ffffff] bg-[#083344] hover:bg-[#184856] hover:shadow-lg transition ease-in-out duration-300 p-3 rounded-lg gap-1"
                      >
                        Authenticate
                      </button>
                    </form>
                  </div>
                </div>
                <div className="absolute bottom-0 -z-20 w-full h-screen overflow-visible">
                  <Wave
                    className="absolute bottom-0"
                    fill="#083344"
                    paused={false}
                    style={{ display: "flex" }}
                    options={{
                      height: 60,
                      amplitude: 60,
                      speed: 0.15,
                      points: 7,
                    }}
                  />{" "}
                  <Wave
                    className="absolute bottom-0 opacity-40"
                    fill="#083344"
                    paused={false}
                    style={{ display: "flex" }}
                    options={{
                      height: 50,
                      amplitude: 60,
                      speed: 0.15,
                      points: 7,
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 h-screen flex flex-col justify-between">
                  <div
                    className="z-50 w-full flex justify-between bg-slate-100 px-10 py-2.5 shadow-slate-200 shadow-md"
                    style={{
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundBlendMode: "overlay",
                    }}
                  >
                    {testName && (
                      <h2 className="montserrat text-[22px] items-center flex">
                        {testName}
                      </h2>
                    )}
                    <div className="flex justify-between gap-6 items-center font-medium text-gray-700 text-[14.5px]">
                      <div className="items-center hidden space-x-2">
                        <span className="text-[#083344] font-medium">
                          {fullScreenMode ? "Minimize" : "Full Screen"}
                        </span>
                        <Switch
                          checked={fullScreenMode}
                          onChange={toggleFullScreen}
                          checkedChildren=""
                          unCheckedChildren=""
                          style={{
                            backgroundColor: fullScreenMode
                              ? "#083344"
                              : "#b2d5dc",
                            borderColor: fullScreenMode ? "#083344" : "#b2d5dc",
                          }}
                        />
                      </div>
                      {remainingTime !== null && (
                        <h2 className="flex gap-1.5 items-center">
                          Auto Submit in
                          <AccessTimeIcon
                            fontSize="small"
                            className="text-gray-400"
                          />
                          <p className="text-[17px] text-green-600 poppins">
                            {formatTime(remainingTime)}
                          </p>
                        </h2>
                      )}
                      <button
                        onClick={triggerFormSubmit}
                        disabled={isSubmitDisabled || submitLoading}
                        type="submit"
                        className="bg-cyan-700 p-2.5 rounded-md flex items-center gap-2 text-white font-medium text-[14.5px]"
                        // disabled={!areAllQuestionsAnswered}
                      >
                        {submitLoading && <Spinner size="sm" color="default" />}
                        Submit Test
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-full flex items-center justify-between pl-10 gap-5 bg-slate-50">
                    <div className="w-full max-h-[72vh] flex items-center justify-between gap-2">
                      {/* Left Panel */}
                      <div
                        className="h-full min-w-[500px] p-1"
                        style={{
                          width: `${leftWidth}%`,
                        }}
                      >
                        <QuestionsBySector testId={testId} />
                      </div>

                      {/* Resizable Divider with Thumb */}
                      <div
                        className="relative flex h-7 w-[18px] overflow-hidden items-center justify-center rounded-[4px] cursor-col-resize"
                        onMouseDown={handleMouseDown}
                      >
                        {/* Thumb */}
                        <DragIndicatorTwoToneIcon />
                      </div>

                      {/* Right Panel */}
                      <div
                        className="h-full min-w-[400px] p-1"
                        style={{
                          width: `calc(100% - ${leftWidth}% - 10px)`,
                        }}
                      >
                        <div className="gap-5 flex flex-col">
                          <div
                            className="h-auto bg-white border-[2px] border-[#155e75] rounded-lg px-6 py-4"
                            style={{
                              boxShadow: "0px 2.5px 0px 0px #155e75",
                            }}
                          >
                            <h1 className="text-[17px] mb-5 text-[#164e63] font-medium">
                              Notes here!
                            </h1>

                            {/* Text Input Area */}
                            <textarea
                              className="w-full h-[13vh] mb-2 p-2 border-[1px] border-slate-300 rounded-md resize-none text-[14px] focus:outline-none"
                              placeholder="Type something..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                            />

                            {/* Calculator */}
                            <div className="w-[80%] mx-auto">
                              <Calculator />
                            </div>
                            {/* Drawing Area */}
                            {/* <div
                              className="mt-4 border-[1.5px] border-slate-300 bg-slate-50 rounded-md overflow-auto"
                              style={{
                                height: "32vh",
                                maxWidth: "500px",
                              }}
                            > */}
                            {/* <canvas
                                ref={canvasRef}
                                className="rounded-md"
                                width={1000}
                                height={1000}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                              /> */}
                            {/* Color Picker and Size Changer */}
                            {/* <div className="mt-4 min-w-[150px]">
                                <label className="mr-2">Pencil Color:</label>
                                <input
                                  type="color"
                                  value={color}
                                  onChange={(e) => setColor(e.target.value)}
                                />
                                <label className="ml-4 mr-2">
                                  Pencil Size:
                                </label>
                                <input
                                  type="range"
                                  min="1"
                                  max="20"
                                  value={lineWidth}
                                  onChange={(e) => setLineWidth(e.target.value)}
                                />
                                <span className="ml-2">{lineWidth}</span>
                              </div> */}
                            {/* </div> */}
                          </div>
                          <div
                            className="w-full h-14 p-2 flex items-center rounded-lg justify-end px-4 border-[2px] border-[#155e75] text-cyan-900 bg-white"
                            style={{
                              boxShadow: "0px 2.5px 0px 0px #155e75",
                            }}
                          >
                            <button
                              onClick={clearCanvas}
                              className="text-[15px] font-medium bg-slate-100 py-2 px-3 rounded-md"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <FormGroup>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          width: 94,
                          maxHeight: "72vh",
                          overflow: "hidden",
                          overflowY: "scroll",
                          padding: "14px 5px",
                          alignItems: "center",
                          justifyItems: "center",
                          backgroundColor: "#ffffff",
                          boxShadow: "0px 0px 7px 0px #e2e8f0",
                          borderRadius: "10px 0px 0px 10px",
                          transition: "scale 0.3s ease-in-out",
                          "&:hover": {
                            scale: 1.01,
                          },
                        }}
                      >
                        {questions.map((question, index) => (
                          <Box
                            key={question._id}
                            onClick={() => handleBoxClick(index)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "31px",
                              height: "31px",
                              borderRadius: "5px",
                              border: "1.5px solid",
                              borderColor: selectedIndexes.includes(index)
                                ? "#083344"
                                : selectedAnswers[question._id]
                                ? "#e2e8f0"
                                : "#e2e8f0",
                              backgroundColor: selectedIndexes.includes(index)
                                ? "#0e7490"
                                : selectedAnswers[question._id]
                                ? "#b2d5dc"
                                : "white",
                              color: selectedIndexes.includes(index)
                                ? "white"
                                : selectedAnswers[question._id]
                                ? "#083344"
                                : "black",
                              cursor: "pointer",
                              marginBottom: "10px",
                              textAlign: "center",
                            }}
                          >
                            <p className="poppins text-[16px] font-medium">
                              {index + 1}
                            </p>
                          </Box>
                        ))}
                      </Box>
                    </FormGroup>
                  </div>

                  {/* Progress Loader */}
                  <div
                    className="bg-white w-full h-16 items-center justify-center flex"
                    style={{
                      boxShadow: "0px 0px 10px 0px #cbd5e1",
                    }}
                  >
                    {/* Loader bar */}
                    <div
                      className="flex items-center"
                      style={{
                        width: "90vw",
                        backgroundColor: "#b1d5dc",
                        borderRadius: "8px",
                        height: "13px",
                      }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: "#0e7490",
                          height: "100%",
                          borderRadius: "8px",
                          transition: "width 0.5s ease-in-out",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default QuestionComponent;
