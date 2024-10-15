import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import AppRouter from "./routes/Router.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import QuestionComponent from "./components/Questions.tsx";

function App() {
  // Check if the current path matches "/tests/:testId"
  const isTestPage = useMatch("/tests/:testId");

  return (
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
  );
}

export default App;
