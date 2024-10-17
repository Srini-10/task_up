import React, { useState } from "react";
import { Input, Form, Select } from "antd";
import { Button } from "@mui/material";

const { Option } = Select;
const { TextArea } = Input;

const AddQuestion = ({ questions, setQuestions }) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);

  const questionTypes = ["Multiple Choice", "Select", "Radio", "Text Input"];

  const handleAddQuestion = () => {
    const newQuestion = {
      questionText,
      inputType: questionType,
      options: questionType !== "Text Input" ? options : [],
      correctAnswers:
        questionType === "Multiple Choice"
          ? correctAnswers
          : correctAnswers.length > 0
          ? [correctAnswers[0]]
          : [],
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText("");
    setQuestionType("");
    setOptions(["", "", "", ""]);
    setCorrectAnswers([]);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleCorrectAnswerChange = (value) => {
    if (questionType === "Multiple Choice") {
      setCorrectAnswers(value);
    } else if (questionType === "Select" || questionType === "Radio") {
      setCorrectAnswers([value]);
    }
  };

  const renderOptionsInput = () => {
    if (["Multiple Choice", "Select", "Radio"].includes(questionType)) {
      return options.map((option, index) => (
        <Input
          className="w-full min-h-[40px] my-1"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
        />
      ));
    }
    return null;
  };

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
    } else if (["Select", "Radio"].includes(questionType)) {
      return (
        <Form.Item className="mt-3" label="Select Correct Answer">
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

  // Updated splitText function to handle new patterns (`**`, `$$`, `%%`)
  const splitText = (text) => {
    const patterns = [
      { regex: /`\*{([^%]+)}\*`/g, type: "code" },
      { regex: /\*\*([^%]+)\*\*/g, type: "bold" },
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

        // Push the matched part based on its type
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

  return (
    <Form layout="vertical">
      <TextArea
        className="mt-2"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Enter your question"
        rows={4}
      />

      <Select
        placeholder="Select Question Type"
        className="w-full min-h-[40px] rounded-[8px] mt-2 mb-3"
        value={questionType}
        onChange={(value) => setQuestionType(value)}
      >
        <Option value="" disabled>
          Select Question Type
        </Option>
        {questionTypes.map((type, index) => (
          <Option key={index} value={type}>
            {type}
          </Option>
        ))}
      </Select>

      {renderOptionsInput() && <h1 className="mt-1">Add options</h1>}
      {renderOptionsInput()}
      {renderCorrectAnswerInput()}

      <div className="mt-4">
        {splitText(questionText).map((part, index) => {
          if (part.type === "code") {
            return (
              <pre
                key={index}
                className="p-2 mb-2 border overflow-scroll border-gray-300 rounded bg-gray-100"
              >
                <code className="text-sm">{part.content}</code>
              </pre>
            );
          } else {
            // return (
            //   <textarea
            //     draggable={false}
            //     key={index}
            //     className="text-[15px] w-full h-auto text-black"
            //   >
            //     {part.content.trimStart()}
            //   </textarea>
            // );
            return null;
          }
        })}
      </div>

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
          <p className="text-white text-[15px] px-1.5">Add Question</p>
        </Button>
      </div>
    </Form>
  );
};

export default AddQuestion;
