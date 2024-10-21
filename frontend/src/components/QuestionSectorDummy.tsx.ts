<div
  className="h-full min-w-[500px] p-1"
  style={{
    width: `${leftWidth}%`,
  }}
>
  <div className="gap-5 flex flex-col">
    <div
      className="w-full h-14 flex items-center justify-between px-4 text-cyan-900 bg-white border-[2px] border-[#155e75] rounded-xl"
      style={{
        boxShadow: "0px 2.5px 0px 0px #155e75",
      }}
    >
      <div className="">
        {questions.map((question, index) =>
          selectedIndexes.includes(index) ? (
            <p className="font-medium">
              Question No: {index + 1} {" / "}
              {questions.length}
            </p>
          ) : null
        )}
      </div>
      <div className="cursor-pointer" onClick={handleBookmarkClick}>
        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </div>
    </div>

    {/* Questions */}
    <form
      ref={formRef}
      onSubmit={() => handleSubmit}
      className="px-10 py-8 h-auto bg-white overflow-hidden select-none rounded-xl border-[2px] border-[#155e75]"
      style={{
        boxShadow: "0px 2.5px 0px 0px #155e75",
      }}
    >
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
                      className="mb-2 h-full rounded-lg bg-[#011827] overflow-scroll"
                    >
                      <SyntaxHighlighter language="javascript" style={nightOwl}>
                        {part.content}
                      </SyntaxHighlighter>
                    </pre>
                  );
                }

                // Handle bold part rendering (split by lines)
                if (part.type === "bold") {
                  return part.content.split("\n").map((line, lineIdx) => (
                    <p key={lineIdx} className="font-bold text-black leading-6">
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
    <div
      className="w-full h-16 flex items-center justify-between px-4 border-[2px] border-[#155e75] text-slate-600 bg-white rounded-xl"
      style={{
        boxShadow: "0px 2.5px 0px 0px #155e75",
      }}
    >
      <div className="flex gap-7">
        <h1 className="text-[#164e63]">Focus & Conquer!</h1>
      </div>
      <Box
        sx={{
          display: "flex",
          gap: "12px",
          color: "#164e63",
          alignItems: "center",
        }}
      >
        <button
          className={`text-[15px] font-medium py-2 px-3 rounded-md ${
            selectedIndexes[0] === 0
              ? "bg-slate-100 cursor-not-allowed"
              : "bg-slate-100 hover:bg-cyan-800 hover:text-slate-100"
          }`}
          onClick={handlePrevious}
          disabled={selectedIndexes[0] === 0}
        >
          <ArrowBackIosNewIcon style={{ fontSize: "15px" }} />
          Prev
        </button>

        <button
          className={`text-[15px] font-medium py-2 px-3 rounded-md ${
            selectedIndexes[0] === questions.length - 1
              ? "bg-slate-100 cursor-not-allowed"
              : "bg-slate-100 hover:bg-cyan-800 hover:text-slate-100"
          }`}
          onClick={handleNext}
          disabled={selectedIndexes[0] === questions.length - 1}
        >
          Next <ArrowForwardIosIcon style={{ fontSize: "15px" }} />
        </button>
      </Box>
    </div>
  </div>
</div>;
