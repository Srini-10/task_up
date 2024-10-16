import React, { useState } from "react";
import { Input, Form, Select } from "antd";
import { Button } from "@mui/material";

const { Option } = Select;

const AddQuestion = ({ questions, setQuestions }) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState(""); // State for question type
  const [options, setOptions] = useState(["", "", "", ""]); // Start with 4 empty options
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]); // Initial state is an empty array of strings

  // Available question types
  const questionTypes = ["Multiple Choice", "Select", "Radio", "Text Input"];

  // Add a new question to the list
  const handleAddQuestion = () => {
    const newQuestion = {
      questionText,
      inputType: questionType,
      options: questionType !== "Text Input" ? options : [],
      correctAnswers:
        questionType === "Multiple Choice"
          ? correctAnswers
          : correctAnswers.length > 0
          ? [correctAnswers[0]] // Single correct answer for Select/Radio
          : [],
    };

    setQuestions([...questions, newQuestion]);

    // Reset fields after adding
    setQuestionText("");
    setQuestionType("");
    setOptions(["", "", "", ""]);
    setCorrectAnswers([]);
  };

  // Handle change in the options array
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  // Handle selection of correct answers
  const handleCorrectAnswerChange = (value) => {
    if (questionType === "Multiple Choice") {
      setCorrectAnswers(value); // Allow multiple correct answers
    } else if (questionType === "Select" || questionType === "Radio") {
      setCorrectAnswers([value]); // Only allow a single correct answer
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
        <Input
          className="w-full min-h-[40px] my-1"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
        />
      ));
    }
    return null; // No options for Text Input
  };

  // Render the correct answer selection input
  const renderCorrectAnswerInput = () => {
    if (questionType === "Multiple Choice") {
      return (
        <Form.Item className="mt-3" label="Select Correct Answers">
          <Select
            className="w-full min-h-[40px] -mt-1"
            mode="multiple"
            value={correctAnswers}
            onChange={handleCorrectAnswerChange}
            placeholder="Correct Answers"
          >
            {options.map((option, index) => (
              <Option key={index} value={index}>
                {`${option || `Option ${index + 1}`}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    } else if (questionType === "Select" || questionType === "Radio") {
      return (
        <Form.Item className="mt-3" label="Select Correct Answers">
          <Select
            className="w-full min-h-[40px] -mt-1"
            value={correctAnswers.length > 0 ? correctAnswers[0] : undefined}
            onChange={handleCorrectAnswerChange}
            placeholder="Correct Answer"
          >
            {options.map((option, index) => (
              <Option key={index} value={index}>
                {`${option || `Option ${index + 1}`}`}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }
    return null;
  };

  return (
    <Form layout="vertical">
      <Input
        className="mt-2"
        style={{
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          padding: "8px 12px",
        }}
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Enter your question"
      />

      {/* Select box for choosing the question type */}

      <Select
        placeholder="Select Question Type"
        className="w-full min-h-[40px] rounded-[8px] mt-2 mb-3"
        style={{
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        value={questionType}
        onChange={(value) => setQuestionType(value)}
      >
        {/* Placeholder option */}
        <Option value="" disabled>
          <p className="text-neutral-400 opacity-70">Select Question Type</p>
        </Option>

        {questionTypes.map((type, index) => (
          <Option key={index} value={type}>
            {type}
          </Option>
        ))}
      </Select>

      {/* Conditionally display "Add options" if renderOptionsInput() returns something */}
      {renderOptionsInput() && (
        <h1 className="text-[#000000] text-[14px] mt-1">Add options</h1>
      )}

      {/* Render dynamic inputs based on selected question type */}
      {renderOptionsInput()}

      {/* Render correct answer input if the question type requires it */}
      {renderCorrectAnswerInput()}

      {/* Button to add the question */}
      <div className="w-full flex justify-end">
        <Button
          onClick={handleAddQuestion}
          disabled={questionText === "" || questionType === ""}
          style={{
            width: "150px",
            marginBottom: "10px",
            background: "#083344",
          }}
        >
          <p
            className="poppins text-[15px] px-1.5 normal-case text-white"
            style={{
              textDecorationThickness: "1.5px",
              textUnderlineOffset: "2px",
            }}
          >
            Add Question
          </p>
        </Button>
      </div>
    </Form>
  );
};

export default AddQuestion;
