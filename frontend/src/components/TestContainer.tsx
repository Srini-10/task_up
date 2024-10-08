import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Button, Alert } from "@mui/material";

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
  const navigate = useNavigate();

  // Fetch recently added tests from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get(
          "https://taskup-backend.vercel.app/api/tests/recent"
        ); // Your server URL and port
        setTests(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    };
    fetchTests();
  }, []);

  // Function to handle test deletion
  const handleDeleteTest = async (testId) => {
    try {
      const response = await axios.delete(
        `https://taskup-backend.vercel.app/api/tests/${testId}`
      );
      alert(response.data.message);
      // After deletion, fetch the updated list of tests
      setTests(tests.filter((test) => test._id !== testId));
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("An error occurred while deleting the test.");
    }
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

  if (loading) {
    return <div>Loading tests...</div>;
  }

  return (
    <div>
      <h2>Recently Added Tests</h2>
      {tests.map((test) => (
        <Card key={test._id} style={{ marginBottom: "20px", padding: "20px" }}>
          <h3>{test.testName}</h3>

          {/* Test sharing link */}
          <p>
            <strong>Test Link:</strong>
            <a
              href={`http://localhost:3000/tests/${test._id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              http://localhost:3000/tests/{test._id}
            </a>
          </p>

          {/* Test status alert */}
          <Alert
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
            {getTestStatus(test.startDate, test.endDate) === "ended" && "Ended"}
          </Alert>

          {/* Buttons for editing and deleting the test */}
          <div style={{ marginTop: "10px" }}>
            <Button
              variant="contained"
              color="primary"
              style={{ marginRight: "10px" }}
              onClick={() => {
                // Clear the tests state to remove all data
                resetForm();
                // Navigate to the edit page
                navigate(`/tests/edit/${test._id}`);
              }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleDeleteTest(test._id)}
            >
              Delete
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TestContainer;
