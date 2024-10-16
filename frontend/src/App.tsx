import React, { useState, useEffect } from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import AppRouter from "./routes/Router.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import QuestionComponent from "./components/Questions.tsx";

function App() {
  const [isWideScreen, setIsWideScreen] = useState<boolean>(true);

  // Check if the current path matches "/tests/:testId"
  const isTestPage = useMatch("/tests/:testId");

  // Check window width and update state accordingly
  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 1024);
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Initial check on mount
    handleResize();

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isWideScreen ? (
        <>
          {isTestPage ? (
            <Routes>
              <Route path="/tests/:testId" element={<QuestionComponent />} />
            </Routes>
          ) : (
            <div className="w-full h-screen overflow-y-scroll flex flex-col justify-between">
              <Navbar />
              <div className="w-full h-[calc(100vh-45px)] flex justify-between">
                <div className="w-[350px] h-full overflow-y-scroll bg-[#05202b]">
                  <Sidebar />
                </div>
                <div className="w-full h-full">
                  <AppRouter />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-5">
          <p className="text-xl text-gray-600">
            Please view this on a larger screen to see the content.
          </p>
        </div>
      )}
    </>
  );
}

export default App;
