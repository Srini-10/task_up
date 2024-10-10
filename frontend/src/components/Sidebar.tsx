import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TestLogo from "../assets/Test_Outline.svg";
import TestFilledLogo from "../assets/Test_Filled.svg";
import AssessmentLogo from "../assets/Assessment_Outline.svg";
import AssessmentFilledLogo from "../assets/Assessment_Filled.svg";
import DashboardLogo from "../assets/Dashboard_Outline.svg";
import DashboardFilledLogo from "../assets/Dashboard_Filled.svg";
import AskAILogo from "../assets/AskAI_Outline.svg";
import AskAIFilledLogo from "../assets/AskAI_Filled.svg";
import CodeUpLogo from "../assets/Code_Outline.svg";
import CodeUpFilledLogo from "../assets/Code_Filled.svg";
import "../index.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      name: "Test",
      logo: TestLogo,
      filledLogo: TestFilledLogo,
      isActive:
        location.pathname === "/" ||
        location.pathname.startsWith("/tests/edit"),
      path: "/",
    },
    {
      name: "Dashboard",
      logo: DashboardLogo,
      filledLogo: DashboardFilledLogo,
      isActive: location.pathname === "/dashboard",
      path: "/dashboard",
    },
    {
      name: "Assessment",
      logo: AssessmentLogo,
      filledLogo: AssessmentFilledLogo,
      isActive: location.pathname === "/assessment",
      path: "/assessment",
    },
    {
      name: "Candidates",
      logo: AskAIFilledLogo,
      filledLogo: AskAILogo,
      isActive: location.pathname === "/CreateCandidates",
      path: "/CreateCandidates",
    },
    {
      name: "Employees",
      logo: CodeUpFilledLogo,
      filledLogo: CodeUpLogo,
      isActive: location.pathname === "/Employees",
      path: "/Employees",
    },
    {
      name: "Settings",
      logo: CodeUpFilledLogo,
      filledLogo: CodeUpLogo,
      isActive: location.pathname === "/Settings",
      path: "/Settings",
    },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full w-full pt-10 pb-5 justify-between shadow-black shadow-inner">
      <div className="w-full h-full flex flex-col justify-start items-end gap-5">
        {menuItems.slice(0, 2).map((item) => (
          <div
            key={item.path}
            onClick={() => handleClick(item.path)}
            className={`flex gap-3 items-center justify-start pl-4 rounded-tl-xl rounded-bl-xl w-[80%] h-[45px] cursor-pointer ${
              item.isActive ? "shadow-gray-500 shadow-inner bg-[#cfe1e5]" : ""
            }`}
          >
            <img
              className="max-h-6 rounded"
              src={item.isActive ? item.filledLogo : item.logo}
              alt={item.name}
            />
            <p
              className={`font-medium text-[13px] ${
                item.isActive ? "text-gray-900" : "text-white"
              } poppins`}
            >
              {item.name}
            </p>
          </div>
        ))}
        {/* Recruitment Title */}
        <h2 className="font-bold text-md mb-2 text-gray-500 w-full pl-5 poppins2 uppercase">
          Recruitment
        </h2>
        {menuItems.slice(2, 4).map((item) => (
          <div
            key={item.path}
            onClick={() => handleClick(item.path)}
            className={`flex gap-3 items-center justify-start pl-4 rounded-tl-xl rounded-bl-xl w-[80%] h-[45px] cursor-pointer ${
              item.isActive ? "shadow-gray-500 shadow-inner bg-[#cfe1e5]" : ""
            }`}
          >
            <img
              className="max-h-6 rounded"
              src={item.isActive ? item.filledLogo : item.logo}
              alt={item.name}
            />
            <p
              className={`font-medium text-[13px] ${
                item.isActive ? "text-gray-900" : "text-white"
              } poppins`}
            >
              {item.name}
            </p>
          </div>
        ))}

        {/* Organizations Title */}
        <h2 className="font-bold text-md mb-2 text-gray-500 w-full pl-5 poppins2 uppercase">
          Organizations
        </h2>
        {menuItems.slice(4, 6).map((item) => (
          <div
            key={item.path}
            onClick={() => handleClick(item.path)}
            className={`flex gap-3 items-center justify-start pl-4 rounded-tl-xl rounded-bl-xl w-[80%] h-[45px] cursor-pointer ${
              item.isActive ? "shadow-gray-500 shadow-inner bg-[#cfe1e5]" : ""
            }`}
          >
            <img
              className="max-h-6 rounded"
              src={item.isActive ? item.filledLogo : item.logo}
              alt={item.name}
            />
            <p
              className={`font-medium text-[13px] ${
                item.isActive ? "text-gray-900" : "text-white"
              }`}
            >
              {item.name}
            </p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <h1 className="text-[14px] text-gray-100 font-semibold poppins2">
          TuneUp Technologies
        </h1>
        <p className="text-[10px] text-gray-500">
          © Copyright 2024, All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
