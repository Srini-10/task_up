import React, { useState } from "react";
import { evaluate } from "mathjs"; // Importing evaluate function from math.js
import "./Calculator.css"; // Import styles for the calculator

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isScientific, setIsScientific] = useState(false);

  const handleButtonClick = (value) => {
    setInput((prev) => prev + value);
  };

  const clearInput = () => {
    setInput("");
    setResult("");
  };

  const deleteLast = () => {
    setInput(input.slice(0, -1));
  };

  const calculateResult = () => {
    try {
      setResult(evaluate(input)); // Use math.js to evaluate the input safely
    } catch (error) {
      setResult("Error");
    }
  };

  const handleScientificOperation = (operation) => {
    let scientificResult;
    switch (operation) {
      case "sin":
        scientificResult = Math.sin(parseFloat(input));
        break;
      case "cos":
        scientificResult = Math.cos(parseFloat(input));
        break;
      case "tan":
        scientificResult = Math.tan(parseFloat(input));
        break;
      case "log":
        scientificResult = Math.log10(parseFloat(input));
        break;
      case "ln":
        scientificResult = Math.log(parseFloat(input));
        break;
      case "sqrt":
        scientificResult = Math.sqrt(parseFloat(input));
        break;
      case "exp":
        scientificResult = Math.exp(parseFloat(input));
        break;
      case "pow":
        scientificResult = Math.pow(parseFloat(input), 2); // Square the number
        break;
      default:
        break;
    }
    setResult(scientificResult);
  };

  const toggleScientific = () => {
    setIsScientific(!isScientific);
  };

  return (
    <div className="calculator-container">
      <div className="calculator-display">
        <div className="input-display">{input || "0"}</div>
        <div className="result-display">{result}</div>
      </div>
      <div className="calculator-buttons">
        <button onClick={clearInput}>AC</button>
        <button onClick={deleteLast}>⌫</button>
        <button onClick={() => handleButtonClick("%")}>%</button>
        <button onClick={() => handleButtonClick("/")}>÷</button>

        <button onClick={() => handleButtonClick("7")}>7</button>
        <button onClick={() => handleButtonClick("8")}>8</button>
        <button onClick={() => handleButtonClick("9")}>9</button>
        <button onClick={() => handleButtonClick("*")}>×</button>

        <button onClick={() => handleButtonClick("4")}>4</button>
        <button onClick={() => handleButtonClick("5")}>5</button>
        <button onClick={() => handleButtonClick("6")}>6</button>
        <button onClick={() => handleButtonClick("-")}>−</button>

        <button onClick={() => handleButtonClick("1")}>1</button>
        <button onClick={() => handleButtonClick("2")}>2</button>
        <button onClick={() => handleButtonClick("3")}>3</button>
        <button onClick={() => handleButtonClick("+")}>+</button>

        <button onClick={() => handleButtonClick("0")}>0</button>
        <button onClick={() => handleButtonClick(".")}>.</button>
        <button onClick={calculateResult}>=</button>

        {isScientific && (
          <>
            <button onClick={() => handleScientificOperation("sin")}>
              sin
            </button>
            <button onClick={() => handleScientificOperation("cos")}>
              cos
            </button>
            <button onClick={() => handleScientificOperation("tan")}>
              tan
            </button>
            <button onClick={() => handleScientificOperation("sqrt")}>√</button>
            <button onClick={() => handleScientificOperation("log")}>
              log
            </button>
            <button onClick={() => handleScientificOperation("ln")}>ln</button>
            <button onClick={() => handleScientificOperation("exp")}>eˣ</button>
            <button onClick={() => handleScientificOperation("pow")}>x²</button>
          </>
        )}
      </div>
      <button className="toggle-btn" onClick={toggleScientific}>
        {isScientific ? "Basic" : "Scientific"}
      </button>
    </div>
  );
};

export default Calculator;
