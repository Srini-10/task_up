import React, { useState, useEffect } from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import AppRouter from "./routes/Router.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import QuestionComponent from "./components/Questions.tsx";
import { Spin } from "antd";

function App() {
  const [isWideScreen, setIsWideScreen] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // New loading state
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const fixedUsername = "Fools";
  const fixedPassword = "Password@123";

  const isTestPage = useMatch("/tests/:testId");

  // Check authentication on page load
  useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      setIsAuthenticated(true);
    }
    setLoading(false); // Set loading to false after checking auth status
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const screenWidth = window.screen.width;
      setIsWideScreen(width > screenWidth * 0.05);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    if (username === fixedUsername && password === fixedPassword) {
      localStorage.setItem("auth", JSON.stringify({ username, password }));
      setIsAuthenticated(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  // Show a loading animation while checking authentication status
  if (loading) {
    return (
      <div className="absolute z-50 backdrop-blur-[2px] top-0 left-0 w-full h-full flex justify-center items-center">
        <Spin size="large" className="custom-spin" />
      </div>
    );
  }

  if (isTestPage || isAuthenticated) {
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
                  <div className="min-w-[280px] max-w-[280px] h-full overflow-y-scroll bg-[#05202b]">
                    <Sidebar />
                  </div>
                  <div className="w-full h-full">
                    <AppRouter />
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="absolute right-0 top-0 py-2 px-4 h-[45px] text-[14px] font-medium bg-[#083344] text-white"
                >
                  Logout
                </button>
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
  } else {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl poppins2 font-semibold text-center text-gray-800">
            Admin Login
          </h1>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-[16px] px-4 py-2 mt-2 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <input
                type="password" // Change to password input type
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-[16px] px-4 py-2 mb-2 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 mt-4 font-medium text-white bg-cyan-900 rounded-lg hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
