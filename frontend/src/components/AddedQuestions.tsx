import React, { useEffect, useState } from "react";
import { List, Modal, Popconfirm, Form, Switch, Select, Input } from "antd";
import { IconButton } from "@mui/material";
import EditIcon from "../assets/EditIcon.tsx";
import TrashIcon from "../assets/TrashIcon.tsx";
import EyeIcon from "../assets/EyeIcon.tsx";

const { Option } = Select;

const AddedQuestions = ({
  questions,
  handleViewQuestion,
  handleEditQuestion,
  handleConfirmDelete,
  isViewModalOpen,
  handleCloseViewModal,
  viewQuestionIndex,
  isEditModalOpen,
  editingQuestion,
  editQuestionIndex,
  handleSaveEditedQuestion,
  isRequired,
  setIsRequired,
  handleQuestionTextChange,
  handleInputTypeChange,
  questionTypes,
  handleOptionChange,
  handleCorrectAnswerSelect,
  setIsEditModalOpen,
  sectorOptions,
  handleSectorChange,
}) => {
  const [sectors, setSectors] = useState<string[]>([]);
  // Load sectors from localStorage on component mount
  useEffect(() => {
    const storedSectors = JSON.parse(localStorage.getItem("sectors") || "[]");
    setSectors(storedSectors);
  }, []);

  // Group questions by sector
  const groupedQuestions = questions.reduce((groups, question, idx) => {
    const { sector } = question;
    if (!groups[sector]) {
      groups[sector] = [];
    }
    groups[sector].push({ ...question, originalIndex: idx });
    return groups;
  }, {});

  console.log(sectorOptions, sectors);

  return (
    <>
      <div className="w-full">
        {Object.keys(groupedQuestions).length > 0 ? (
          <>
            <List>
              <h1 className="poppins2 text-[20px] mb-1 text-[#083344]">
                Added Questions
              </h1>
              {Object.entries(groupedQuestions).map(
                ([sector, sectorQuestions], sectorIndex) => (
                  <div key={sectorIndex}>
                    <h2 className="poppins2 text-[18px] mt-4 mb-2 py-1.5 px-3 rounded-lg bg-[#dbe2e5] text-[#083344]">
                      {sector}
                    </h2>
                    {sectorQuestions.map((question, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="flex justify-between items-start border-b-[1.5px] pb-2 border-gray-100"
                      >
                        <h1 className="mt-3 poppins text-[14px] flex overflow-hidden w-[330px] text-[#000000]">
                          <p className="text-red-500">
                            {question.required ? "*" : ""}
                          </p>
                          {questionIndex + 1}. {question.questionText}
                        </h1>
                        <div className="gap-0.5 flex">
                          <IconButton
                            edge="end"
                            aria-label="view"
                            onClick={
                              () => handleViewQuestion(sector, questionIndex) // Use questionIndex here
                            }
                            className="w-[33px] h-[33px]"
                          >
                            <EyeIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={
                              () => handleEditQuestion(sector, questionIndex) // Use questionIndex here
                            }
                            className="w-[33px] h-[33px]"
                          >
                            <EditIcon />
                          </IconButton>
                          <Popconfirm
                            title="Are you sure to delete this question?"
                            onConfirm={() =>
                              handleConfirmDelete(sector, questionIndex)
                            }
                            okText="Yes"
                            cancelText="No"
                          >
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              className="w-[33px] h-[33px]"
                            >
                              <TrashIcon />
                            </IconButton>
                          </Popconfirm>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </List>
          </>
        ) : (
          <p className="text-gray-500 text-[15px]">No questions added yet.</p>
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
                <h1 className="poppins text-[16px] flex text-[#083344]">
                  <p className="text-red-500">
                    {questions[viewQuestionIndex].required ? "*" : ""}
                  </p>
                  {questions[viewQuestionIndex].questionText}
                </h1>
                <h1 className="mt-3 font-semibold">Sector:</h1>
                <p className="mt-1 w-full bg-[#dbe2e5] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                  {questions[viewQuestionIndex].sector}
                </p>
                <h1 className="mt-3 font-semibold">Question Type:</h1>
                <p className="mt-1 w-full bg-[#dbe2e5] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                  {questions[viewQuestionIndex].inputType}
                </p>

                {questions[viewQuestionIndex].inputType !== "Text Input" && (
                  <>
                    <h1 className="mt-3 font-semibold">Options:</h1>
                    <ul className="mt-1 w-full bg-[#dbe2e5] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                      {questions[viewQuestionIndex].options.map(
                        (option, index) => (
                          <li className="list-disc text-[#083344]" key={index}>
                            {option}
                          </li>
                        )
                      )}
                    </ul>

                    <h1 className="flex gap-2 mt-2 font-semibold justify-start">
                      Correct Answer:
                    </h1>
                    <p className="mt-1 w-full bg-[#dbe2e5] text-[#083344] rounded-lg px-5 py-2 gap-0.5 justify-start flex flex-col">
                      {questions[viewQuestionIndex].correctAnswers.length >
                      0 ? (
                        questions[viewQuestionIndex].correctAnswers.map((i) => (
                          <li className="list-disc" key={i}>
                            {questions[viewQuestionIndex].options[i]}
                          </li>
                        ))
                      ) : (
                        <span>N/A</span>
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* Edit Question Modal */}
        {editingQuestion && (
          <Modal visible={isEditModalOpen} closable={false} footer={null}>
            <div className="mt-1">
              <h1 className="poppins2 text-[20px] flex text-[#083344]">
                <p className="text-red-500">
                  {editingQuestion.required ? "*" : ""}
                </p>
                Edit Question
              </h1>

              <Form.Item label="Is this question required?">
                <Switch
                  checked={isRequired}
                  onChange={(checked) => setIsRequired(checked)}
                />
              </Form.Item>

              <Form.Item label="Sector">
                <Select
                  placeholder="Select Sector"
                  className="w-full min-h-[40px] rounded-[8px] mt-2 mb-3"
                  value={editingQuestion?.sector || ""} // Default value or empty string
                  onChange={(value) => {
                    // Set the new sector value
                    handleSectorChange(value);
                  }}
                >
                  {sectors.map((sector, index) => (
                    <Select.Option key={index} value={sector}>
                      {sector}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Input.TextArea
                rows={4}
                placeholder="Question Text"
                value={editingQuestion.questionText}
                onChange={(e) => handleQuestionTextChange(e.target.value)}
                className="h-[40px] mt-2"
              />

              <Select
                value={editingQuestion.inputType}
                onChange={handleInputTypeChange}
                className="h-[40px] mt-2"
              >
                {questionTypes.map((type) => (
                  <Select.Option key={type} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>

              {editingQuestion.inputType !== "Text Input" && (
                <div className="mt-4">
                  <h1 className="text-[16px] poppins text-[#083344]">
                    Options:
                  </h1>
                  {editingQuestion.options.map((option, index) => (
                    <Input
                      key={index}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="h-[40px] my-1"
                    />
                  ))}

                  <Form.Item label="Correct Answer">
                    <Select
                      mode={
                        editingQuestion.inputType === "Multiple Choice"
                          ? "multiple"
                          : undefined
                      }
                      value={editingQuestion.correctAnswers}
                      onChange={(selectedIndices) =>
                        handleCorrectAnswerSelect(selectedIndices)
                      }
                    >
                      {editingQuestion.options.map((option, index) => (
                        <Select.Option key={index} value={index}>
                          {option}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
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
          </Modal>
        )}
      </div>
    </>
  );
};

export default AddedQuestions;
