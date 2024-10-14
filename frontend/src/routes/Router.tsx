import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.tsx";
import EditTest from "../components/EditTest.tsx";
import Dashboard from "../components/Dashboard/Dashboard.tsx";
import CreateCandidates from "../pages/CreateCandidates.tsx";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/CreateCandidates" element={<CreateCandidates />} />
      <Route path="/tests/edit/:testId" element={<EditTest />} />
    </Routes>
  );
}

export default AppRouter;
