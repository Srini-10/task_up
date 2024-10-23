import React, { useState, useEffect } from "react";
import { Input, Form, Select, Switch, Modal, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const AddQuestion = ({ questions, setQuestions }) => {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [isRequired, setIsRequired] = useState(false);
  const [sector, setSector] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSector, setNewSector] = useState("");

  const questionTypes = ["Multiple Choice", "Select", "Radio", "Text Input"];

  // Load sectors from localStorage on component mount
  useEffect(() => {
    const storedSectors = JSON.parse(localStorage.getItem("sectors") || "[]");
    setSectors(storedSectors);
  }, []);

  // Update localStorage whenever sectors change
  useEffect(() => {
    if (sectors.length > 0) {
      localStorage.setItem("sectors", JSON.stringify(sectors));
    }
  }, [sectors]);

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
      required: isRequired,
      sector,
    };

    setQuestions([...questions, newQuestion]);
    setQuestionText("");
    setQuestionType("");
    setOptions(["", "", "", ""]);
    setCorrectAnswers([]);
    setIsRequired(false);
    setSector("");
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

  // Function to show the modal for adding a sector
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Function to handle adding a new sector
  const handleAddSector = () => {
    if (newSector && !sectors.includes(newSector)) {
      const updatedSectors = [...sectors, newSector];
      setSectors(updatedSectors);
      setNewSector("");
      setIsModalVisible(false);
    }
  };

  // Function to close the modal
  const handleCancel = () => {
    setNewSector("");
    setIsModalVisible(false);
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
        placeholder="Select Sector"
        className="w-full min-h-[40px] rounded-[8px] mt-2 mb-3"
        value={sector}
        onChange={setSector}
        allowClear
      >
        <Option value="" disabled>
          Select Sector
        </Option>
        <Option value="Verbal Ability">Verbal Ability</Option>
        <Option value="Logical Reasoning">Logical Reasoning</Option>
        <Option value="Quantitative Aptitude">Quantitative Aptitude</Option>
        <Option value="Data Interpretation">Data Interpretation</Option>
        <Option value="Technical Skills">Technical Skills</Option>
        <Option value="Current Affairs">Current Affairs</Option>
        <Option value="Situational Judgement Tests">
          Situational Judgement Tests
        </Option>
      </Select>

      <Button
        onClick={showModal}
        icon={<PlusOutlined />}
        type="dashed"
        style={{ marginBottom: "10px" }}
      >
        Add New Sector
      </Button>

      <Modal
        title="Add New Sector"
        visible={isModalVisible}
        onOk={handleAddSector}
        onCancel={handleCancel}
        okText="Add Sector"
        cancelText="Cancel"
      >
        <Input
          placeholder="Enter new sector name"
          value={newSector}
          onChange={(e) => setNewSector(e.target.value)}
        />
      </Modal>

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

      <Form.Item label="Is this question required?">
        <Switch
          checked={isRequired}
          onChange={(checked) => setIsRequired(checked)}
          checkedChildren=""
          unCheckedChildren=""
          style={{
            backgroundColor: isRequired ? "#083344" : "#b2d5dc",
            borderColor: isRequired ? "#083344" : "#b2d5dc",
          }}
        />
      </Form.Item>

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
