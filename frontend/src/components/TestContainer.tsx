import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Alert } from "@mui/material";
import { Popconfirm, Spin } from "antd";
import { showToast } from "../toastUtil";

interface Test {
  _id: string;
  testName: string;
  startDate: string;
  endDate: string;
  authOption: string;
}

const TestContainer: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const navigate = useNavigate();

  // Fetch recently added tests from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(
          "https://taskup-backend.vercel.app/api/tests/recent"
        );
        setTests(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
    fetchTests();
  }, []);

  const handleConfirmDelete = (testId: string) => {
    handleDeleteTest(testId);
  };

  const handleDeleteTest = async (testId: string): Promise<void> => {
    setLoadingAnimation(true);
    try {
      const response = await axios.delete(
        `https://taskup-backend.vercel.app/api/tests/${testId}`
      );
      showToast(response.data.message);
      // After deletion, fetch the updated list of tests
      setTests(tests.filter((test) => test._id !== testId));
    } catch (error) {
      console.error("Error deleting test:", error);
      showToast("An error occurred while deleting the test.");
    } finally {
      setLoadingAnimation(false);
    }
  };

  // Function to handle copy to clipboard
  const handleCopyToClipboard = (testId: string) => {
    const link = `https://taskup-brix.vercel.app/tests/${testId}`;
    navigator.clipboard
      .writeText(link)
      .then(() => {
        showToast("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
      });
  };

  // Determine test status (upcoming, ongoing, ended)
  const getTestStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return "upcoming";
    } else if (now >= start && now <= end) {
      return "ongoing";
    } else {
      return "ended";
    }
  };

  const resetForm = () => {
    sessionStorage.removeItem("students");
    sessionStorage.removeItem("questions");
  };

  return (
    <div className="h-full overflow-y-scroll">
      {loadingAnimation ? (
        <div className="absolute z-50 backdrop-blur-[2px] top-0 left-0 w-full h-full flex justify-center items-center">
          <Spin size="large" className="custom-spin" />
        </div>
      ) : null}

      {loading ? (
        <div className="z-50 w-full h-full flex justify-center items-center">
          <Spin size="large" className="custom-spin" />
        </div>
      ) : (
        <>
          <h1 className="text-[20px] font-semibold">Recently Added Tests</h1>
          {tests.map((test, index) => (
            <div
              key={test._id}
              style={{ padding: "20px" }}
              className="bg-slate-50 border-[1.5px] border-slate-200 mt-2 rounded-lg"
            >
              <div className="w-full flex justify-between items-start">
                <h3 className="text-black font-semibold text-[16px]">
                  {index + 1}. {test.testName}
                </h3>
                <div
                  onClick={() => handleCopyToClipboard(test._id)}
                  className="-mt-3.5 -mr-3.5 hover:bg-gray-200 w-6 h-6 pl-[4px] pt-[2px] rounded cursor-pointer"
                >
                  <ion-icon name="copy-outline"></ion-icon>
                </div>
              </div>

              {/* Test sharing link */}
              <div className="flex justify-between -mt-4 items-end">
                <p className="text-[13px] flex flex-col">
                  <a
                    href={`http://taskup-brix.vercel.app/tests/${test._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-slate-600"
                  >
                    https://taskup-brix.vercel.app/tests/{test._id}
                  </a>
                </p>
                {/* Buttons for editing and deleting the test */}
                <div style={{ marginTop: "10px" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: "10px" }}
                    onClick={() => {
                      resetForm();
                      navigate(`/tests/edit/${test._id}`);
                    }}
                  >
                    <ion-icon name="create-outline" />
                  </Button>
                  <Popconfirm
                    title="Are you sure to delete this question?"
                    onConfirm={() => handleConfirmDelete(test._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button variant="contained" color="error">
                      <ion-icon name="trash-outline" />
                    </Button>
                  </Popconfirm>
                </div>
              </div>

              {/* Test status showToast */}
              <Alert
                className="h-10 flex items-center justify-start mt-2"
                severity={
                  getTestStatus(test.startDate, test.endDate) === "upcoming"
                    ? "info"
                    : getTestStatus(test.startDate, test.endDate) === "ongoing"
                    ? "warning"
                    : "error"
                }
              >
                {getTestStatus(test.startDate, test.endDate) === "upcoming" &&
                  "Upcoming"}
                {getTestStatus(test.startDate, test.endDate) === "ongoing" &&
                  "Ongoing"}
                {getTestStatus(test.startDate, test.endDate) === "ended" &&
                  "Ended"}
              </Alert>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TestContainer;
