import React, { useState } from "react";

const TestPage = ({ groupedQuestions }) => {
  const [activeSector, setActiveSector] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Function to handle sector click and display the first question of the sector
  const handleSectorClick = (sector) => {
    setActiveSector(sector);
    setActiveQuestionIndex(0); // Set to the first question
  };

  // Function to handle next question
  const handleNextQuestion = () => {
    if (
      activeSector &&
      activeQuestionIndex < groupedQuestions[activeSector].length - 1
    ) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    }
  };

  // Function to handle previous question
  const handlePreviousQuestion = () => {
    if (activeSector && activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1);
    }
  };

  return (
    <div className="test-page-container">
      <div className="sector-list">
        {Object.keys(groupedQuestions).map((sector, index) => (
          <div
            key={index}
            className={`sector-item w-full h-14 flex items-center justify-between px-4 text-cyan-900 bg-white border-[2px] border-[#155e75] rounded-xl ${
              activeSector === sector ? "active-sector" : ""
            }`}
            style={{
              boxShadow: "0px 2.5px 0px 0px #155e75",
              backgroundColor: activeSector === sector ? "#e0f7fa" : "white", // Highlight active sector
            }}
            onClick={() => handleSectorClick(sector)}
          >
            <span>{sector}</span>
            <span>({groupedQuestions[sector].length})</span>{" "}
            {/* Display total questions count */}
          </div>
        ))}
      </div>

      {/* Display the active question */}
      {activeSector && groupedQuestions[activeSector][activeQuestionIndex] && (
        <div className="question-display">
          <h3>
            {groupedQuestions[activeSector][activeQuestionIndex].questionText}
          </h3>

          <div className="question-navigation">
            <button
              disabled={activeQuestionIndex === 0}
              onClick={handlePreviousQuestion}
              className="nav-button"
            >
              Previous
            </button>
            <button
              disabled={
                activeQuestionIndex ===
                groupedQuestions[activeSector].length - 1
              }
              onClick={handleNextQuestion}
              className="nav-button"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
