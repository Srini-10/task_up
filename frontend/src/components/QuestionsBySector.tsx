import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import SyntaxHighlighter from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { styled } from "@mui/material/styles";

const QuestionsBySector = ({ testId }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [sectors, setSectors] = useState([0]);
  const [activeSector, setActiveSector] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState(() => {
    const storedAnswers = sessionStorage.getItem("selectedAnswers");
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  });
  const [selectedIndexes, setSelectedIndexes] = useState([0]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:20000/api/tests/${testId}/questions`
      );
      const fetchedQuestions = response.data;

      // Sort the questions by sector and order (assuming "order" is a field in the question)
      const sortedQuestions = fetchedQuestions.sort((a, b) => {
        if (a.sector === b.sector) {
          return a.order - b.order; // Sort by order within the same sector
        }
        return a.sector.localeCompare(b.sector); // Sort by sector
      });

      setQuestions(sortedQuestions);

      // Extract unique sectors from the fetched questions
      const uniqueSectors = [
        ...new Set(sortedQuestions.map((question) => question.sector)),
      ];
      setSectors(uniqueSectors);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [testId]);

  const handleSectorClick = (sector) => {
    setActiveSector(sector);

    // Find the first question of the selected sector
    const sectorQuestions = questions.filter(
      (question) => question.sector === sector
    );
    if (sectorQuestions.length > 0) {
      const firstQuestionIndex = questions.findIndex(
        (q) => q._id === sectorQuestions[0]._id
      );
      setSelectedIndexes([firstQuestionIndex]);
    }
  };

  const handleNextQuestion = () => {
    if (selectedIndexes[0] < questions.length - 1) {
      const nextIndex = selectedIndexes[0] + 1;
      setSelectedIndexes([nextIndex]);

      // Change active sector if the question belongs to a different sector
      const nextQuestion = questions[nextIndex];
      if (nextQuestion.sector !== activeSector) {
        setActiveSector(nextQuestion.sector);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (selectedIndexes[0] > 0) {
      const prevIndex = selectedIndexes[0] - 1;
      setSelectedIndexes([prevIndex]);

      // Change active sector if the question belongs to a different sector
      const prevQuestion = questions[prevIndex];
      if (prevQuestion.sector !== activeSector) {
        setActiveSector(prevQuestion.sector);
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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

  return (
    <div className="gap-5 flex flex-col">
      {/* Sectors */}
      <div
        className="w-full h-14 flex items-center justify-between px-4 text-cyan-900 bg-white border-[2px] border-[#155e75] rounded-xl"
        style={{ boxShadow: "0px 2.5px 0px 0px #155e75" }}
      >
        <div className="flex gap-3">
          {sectors.length > 0 ? (
            sectors.map((sector, index) => (
              <button
                key={index}
                className={`cursor-pointer rounded-xl px-4 py-2 ${
                  activeSector === sector
                    ? "bg-[#155e75] text-white"
                    : "bg-white text-[#155e75]"
                }`}
                onClick={() => handleSectorClick(sector)}
              >
                {sector}
              </button>
            ))
          ) : (
            <p>No sectors available</p>
          )}
        </div>
      </div>

      {/* Questions */}
      <form
        className="px-10 py-8 h-auto bg-white overflow-hidden select-none rounded-xl border-[2px] border-[#155e75]"
        style={{
          boxShadow: "0px 2.5px 0px 0px #155e75",
        }}
      >
        {/* Display only the active question */}
        {questions.map((question, index) =>
          selectedIndexes.includes(index) ? (
            <div className="h-[46vh] overflow-y-scroll" key={question._id}>
              <div className="mt-4 flex">
                {question.required && <p className="text-red-500 mr-0.5">*</p>}

                {splitText(question.questionText).map((part, index) => {
                  // Handle code part rendering
                  if (part.type === "code") {
                    return (
                      <pre
                        key={index}
                        className="mb-2 h-full w-full text-[14px] rounded-lg bg-[#011827] overflow-scroll"
                      >
                        <SyntaxHighlighter
                          language="javascript"
                          style={nightOwl}
                        >
                          {part.content}
                        </SyntaxHighlighter>
                      </pre>
                    );
                  }

                  // Handle bold part rendering (split by lines)
                  if (part.type === "bold") {
                    return part.content.split("\n").map((line, lineIdx) => (
                      <p
                        key={lineIdx}
                        className="font-bold text-black leading-6"
                      >
                        {part.content.trim()}
                      </p>
                    ));
                  }

                  // For regular text part
                  return part.content.split("\n").map((line, lineIdx) => {
                    // Check if the line starts with a bullet point (•) or ends with a period
                    if (line.trim().startsWith("•")) {
                      return (
                        <p
                          key={lineIdx}
                          className="text-[14px] poppins0 text-black leading-6"
                        >
                          <span className="list-disc pl-6">{line.trim()}</span>
                        </p>
                      );
                    }

                    // For normal lines (just regular text)
                    return (
                      <p
                        key={lineIdx}
                        className="text-[14px] poppins0 text-black leading-6"
                      >
                        {line.trim()}
                      </p>
                    );
                  });
                })}
              </div>

              <div className="h-[1px] mt-2 w-full opacity-20 bg-cyan-800 rounded-lg"></div>

              <FormControl
                component="fieldset"
                style={{ margin: "20px 0" }}
                className="w-full"
              >
                {/* Text Input */}
                {question.inputType === "Text Input" && (
                  <textarea
                    placeholder="Type your answer here!"
                    onChange={(e) =>
                      handleInputChange(question._id, e.target.value)
                    }
                    value={selectedAnswers[question._id]?.[0] || ""}
                    className="w-full h-[40vh] focus:outline-none resize-none"
                  />
                )}

                {/* Select Dropdown */}
                {question.inputType === "Select" && (
                  <Select
                    value={selectedAnswers[question._id]?.[0]}
                    onChange={(e) =>
                      handleSingleAnswerChange(question._id, e.target.value)
                    }
                    fullWidth
                    style={{ marginTop: "10px" }}
                    displayEmpty
                    renderValue={(selected) =>
                      typeof selected === "number" ? (
                        question.options[selected] // Display the corresponding option text for the index
                      ) : (
                        <p className="text-gray-500">Select answer</p>
                      )
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5 + 8, // Adjust as needed
                          width: 250,
                        },
                      },
                      disableAutoFocusItem: true, // Prevent automatic closing
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select answer
                    </MenuItem>
                    {question.options.map((option, index) => (
                      <MenuItem key={index} value={index}>
                        {" "}
                        {/* Use index as the value */}
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                {/* Radio Buttons */}
                {question.inputType === "Radio" && (
                  <RadioGroup
                    className="h-[40vh]"
                    value={selectedAnswers[question._id]?.[0]}
                    onChange={(e) =>
                      handleSingleAnswerChange(question._id, e.target.value)
                    }
                    style={{ marginTop: "10px" }}
                  >
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index} // Use index as numeric value
                        control={
                          <BpRadio
                            icon={<BpIcon />} // Pass the custom icon to the radio button
                          />
                        }
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Choice (Checkboxes) */}
                {question.inputType === "Multiple Choice" && (
                  <FormGroup className="h-[40vh]">
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <BpCheckbox
                            checked={selectedAnswers[question._id]?.includes(
                              index
                            )}
                            onChange={(e) =>
                              handleMultipleChoiceChange(
                                question._id,
                                index,
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={option}
                      />
                    ))}
                  </FormGroup>
                )}
              </FormControl>
            </div>
          ) : null
        )}
      </form>

      {/* Pagination Controls */}
      <div className="w-full h-16 flex items-center justify-between px-4 border-[2px] border-[#155e75] text-slate-600 bg-white rounded-xl">
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            color: "#164e63",
            alignItems: "center",
            fontWeight: 600,
          }}
        >
          <button
            className={`text-[15px] font-medium py-2 px-3 rounded-md ${
              selectedIndexes[0] === 0
                ? "bg-slate-100 cursor-not-allowed"
                : "bg-slate-100 hover:bg-cyan-800 hover:text-slate-100"
            }`}
            disabled={selectedIndexes[0] === 0}
            onClick={handlePrevQuestion}
          >
            Prev
          </button>

          <button
            className={`text-[15px] font-medium py-2 px-3 rounded-md ${
              selectedIndexes[0] === questions.length - 1
                ? "bg-slate-100 cursor-not-allowed"
                : "bg-slate-100 hover:bg-cyan-800 hover:text-slate-100"
            }`}
            disabled={selectedIndexes[0] === questions.length - 1}
            onClick={handleNextQuestion}
          >
            Next
          </button>
        </Box>
      </div>
    </div>
  );
};

export default QuestionsBySector;
