import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AppRouter from "./routes/Router.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import QuestionComponent from "./components/Questions.tsx";

function App() {
  const location = useLocation();

  // Check if the current path matches "/tests/:testId"
  const isTestPage = location.pathname.startsWith("/tests/");

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
