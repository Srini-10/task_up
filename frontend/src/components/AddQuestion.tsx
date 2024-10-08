import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const AddQuestion = ({ questions, setQuestions }) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState(""); // State for question type
  const [options, setOptions] = useState(["", "", "", ""]); // Start with 4 empty options
  const [correctAnswerIndices, setCorrectAnswerIndices] = useState([]); // Array to store correct answer indices

  // Available question types
  const questionTypes = ["Multiple Choice", "Select", "Radio", "Text Input"];

  // Add a new question to the list
  const handleAddQuestion = () => {
    const newQuestion = {
      questionText,
      inputType: questionType,
      options: questionType !== "Text Input" ? options : [],
      correctAnswerIndices:
        questionType === "Multiple Choice"
          ? correctAnswerIndices
          : correctAnswerIndices.length > 0
          ? [correctAnswerIndices[0]] // Single correct answer for Select/Radio
          : [],
    };

    setQuestions([...questions, newQuestion]);

    // Reset fields after adding
    setQuestionText("");
    setQuestionType("");
    setOptions(["", "", "", ""]);
    setCorrectAnswerIndices([]);
  };

  // Handle change in the options array
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // Handle selection of correct answers
  const handleCorrectAnswerChange = (event) => {
    const value = event.target.value;
    if (questionType === "Multiple Choice") {
      setCorrectAnswerIndices(value); // Allow multiple correct answers
    } else if (questionType === "Select" || questionType === "Radio") {
      setCorrectAnswerIndices([value]); // Only allow a single correct answer
    }
  };

  // Handle dynamic rendering of input fields based on question type
  const renderOptionsInput = () => {
    if (
      questionType === "Multiple Choice" ||
      questionType === "Select" ||
      questionType === "Radio"
    ) {
      return options.map((option, index) => (
        <TextField
          key={index}
          label={`Option ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          fullWidth
          margin="normal"
        />
      ));
    }
    return null; // No options for Text Input
  };

  // Render the correct answer selection input
  const renderCorrectAnswerInput = () => {
    if (questionType === "Multiple Choice") {
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel id="correct-answer-label">
            Select Correct Answers
          </InputLabel>
          <Select
            labelId="correct-answer-label"
            multiple
            value={correctAnswerIndices}
            onChange={handleCorrectAnswerChange}
            renderValue={(selected) =>
              selected
                .map(
                  (i) => `Option ${parseInt(i) + 1}: ${options[parseInt(i)]}`
                )
                .join(", ")
            }
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={index}>
                {`Option ${index + 1}: ${option || `Option ${index + 1}`}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    } else if (questionType === "Select" || questionType === "Radio") {
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel id="correct-answer-label-single">
            Select Correct Answer
          </InputLabel>
          <Select
            labelId="correct-answer-label-single"
            value={
              correctAnswerIndices.length > 0 ? correctAnswerIndices[0] : ""
            } // Check if there's a selected value
            onChange={handleCorrectAnswerChange}
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={index}>
                {`Option ${index + 1}: ${option || `Option ${index + 1}`}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null; // No correct answer needed for Text Input
  };

  return (
    <Box>
      <TextField
        label="Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Select box for choosing the question type */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="question-type-label">Select Question Type</InputLabel>
        <Select
          labelId="question-type-label"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          label="Select Question Type"
        >
          {questionTypes.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Render dynamic inputs based on selected question type */}
      {renderOptionsInput()}

      {/* Render correct answer input if the question type requires it */}
      {renderCorrectAnswerInput()}

      {/* Button to add the question */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddQuestion}
        fullWidth
        style={{ marginTop: "20px" }}
        disabled={questionText === "" || questionType === ""}
      >
        Add Question
      </Button>
    </Box>
  );
};

export default AddQuestion;
