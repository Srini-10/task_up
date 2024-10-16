import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import Calculator from "./Calculator.tsx"; // Import your Calculator component
import { AiOutlineClose } from "react-icons/ai"; // Icon for closing

const DraggableCalculator = () => {
  const [size, setSize] = useState({ width: 300, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const calculatorRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth =
          e.clientX - calculatorRef.current.getBoundingClientRect().left;
        const newHeight =
          e.clientY - calculatorRef.current.getBoundingClientRect().top;
        setSize({
          width: newWidth > 200 ? newWidth : 200, // Set minimum width
          height: newHeight > 300 ? newHeight : 300, // Set minimum height
        });
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleClose = () => {
    setIsMinimized(true);
  };

  return (
    <Draggable
      position={position}
      onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
      bounds="parent" // Keeps the calculator within the viewport
    >
      <div
        ref={calculatorRef}
        className={`calculator-popup ${isMinimized ? "minimized" : ""}`}
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          border: "2px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <div
          className="calculator-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "8px",
            backgroundColor: "#444",
          }}
        >
          <h4 style={{ color: "white" }}>Calculator</h4>
          <button className="control-btn" onClick={handleClose}>
            <AiOutlineClose style={{ color: "white" }} />
          </button>
        </div>
        {!isMinimized && (
          <div
            className="calculator-content"
            style={{ position: "relative", height: "calc(100% - 40px)" }}
          >
            <Calculator />
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: "20px",
                height: "20px",
                backgroundColor: "#666",
                cursor: "se-resize",
              }}
            />
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default DraggableCalculator;
