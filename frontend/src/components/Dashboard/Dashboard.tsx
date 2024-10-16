import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { Spin } from "antd";
import axios from "axios";
import * as XLSX from "xlsx";

// Define the types
interface Test {
  _id: string;
  testName: string;
  startDate: string;
  endDate: string;
  submissionsCount?: number;
}

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  answers: string;
}

interface Answer {
  questionId: string;
  questionText: string;
  selectedAnswer: string;
}

interface Ranking {
  registerNumber: string;
  email: string;
  marks: number;
  submissionTime: Date;
  malpractice: string;
  questions: Question[];
  answers: Answer[];
}

const Dashboard: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  console.log(selectedTestId);

  const handleDownload = () => {
    const workbook = XLSX.utils.book_new();

    // Create an array of table data
    const data = [
      [
        "S.No",
        "Register Number",
        "Email",
        "Submission Time",
        "Marks",
        "Malpractice",
        "Questions",
        ...uniqueQuestions,
      ],
    ];

    // Add table rows to the data array
    rankings.forEach((ranking, index) => {
      const row: string[] = [
        (index + 1).toString(), // Convert index + 1 to string
        ranking.registerNumber,
        ranking.email,
        `${formatDateTime(ranking.submissionTime.toString()).date} ${
          formatDateTime(ranking.submissionTime.toString()).time
        }`,
        ranking.marks.toString(), // Convert marks to string
        ranking.malpractice === "true" ? "Malpractice" : "Genuine",
      ];

      // Append answers for each unique question
      uniqueQuestions.forEach((questionText) => {
        const answer = ranking.answers.find(
          (a) => a.questionText === questionText
        );
        row.push(answer ? String(answer.selectedAnswer) : "N/A"); // Ensure the answer is a string
      });

      data.push(row);
    });

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rankings");

    // Trigger the download
    XLSX.writeFile(workbook, "rankings.xlsx");
  };

  // Fetch all tests when the component mounts
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://taskup-backend.vercel.app/api/tests"
        );
        const testsData: Test[] = response.data;

        const testsWithSubmissionsCount = await Promise.all(
          testsData.map(async (test) => {
            const submissionsResponse = await axios.get(
              `https://taskup-backend.vercel.app/api/tests/${test._id}/submissions-count`
            );
            return {
              ...test,
              submissionsCount: submissionsResponse.data.submissionsCount,
            };
          })
        );

        setTests(testsWithSubmissionsCount);
      } catch (error) {
        console.error("Error fetching tests or submissions count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Fetch rankings when a test is selected
  const fetchRankings = async (testId: string) => {
    try {
      const response = await axios.get(
        `https://taskup-backend.vercel.app/api/tests/${testId}/ranking`
      );
      const rankingData: Ranking[] = response.data;

      const sortedRankings = rankingData.sort((a, b) => b.marks - a.marks);

      setRankings(sortedRankings);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  // Handle opening the modal and fetching rankings
  const handleOpenModal = (testId: string) => {
    setSelectedTestId(testId);
    fetchRankings(testId);
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestId(null);
    setRankings([]);
  };

  // Collect all unique questions from the rankings
  const uniqueQuestions = rankings.length
    ? Array.from(
        new Set(
          rankings.flatMap((ranking) =>
            ranking.answers.map((a) => a.questionText)
          )
        )
      )
    : [];

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <>
      {loading ? (
        <div className="z-50 top-0 left-0 w-full h-full flex justify-center items-center">
          <Spin size="large" className="custom-spin" />
        </div>
      ) : (
        <>
          <div className="w-full h-full">
            <h1 className="p-6 pb-1 font-bold text-[25px] mb-2">
              Test Dashboard
            </h1>

            {/* Render the list of tests */}
            <div className="test-list p-6 pt-1 max-h-[calc(100vh-118.5px)] overflow-y-scroll grid grid-cols-3 gap-4">
              {tests && tests.length > 0 ? (
                tests.map((test) => {
                  const startDate = formatDateTime(test.startDate);
                  const endDate = formatDateTime(test.endDate);
                  return (
                    <div
                      key={test._id}
                      className="test-container bg-slate-100 border-[1.5px] border-slate-200 rounded-lg p-3"
                    >
                      <p className="poppins text-[16.5px]">{test.testName}</p>
                      <div className="bg-[#d5e4ea] rounded-md p-1.5 mt-1.5">
                        <p className="text-[13.5px] text-gray-900 mt-1 flex gap-1 font-medium">
                          Duration:
                          <p className="font-normal text-gray-600">
                            {startDate.date} {startDate.time} - {endDate.date}{" "}
                            {endDate.time}
                          </p>
                        </p>
                        <p className="text-[13.5px] text-gray-900 mt-0.5 flex gap-1 font-medium">
                          Submissions:
                          <p className="font-normal text-gray-600">
                            {test.submissionsCount}
                          </p>
                        </p>
                      </div>
                      <Button
                        style={{
                          marginTop: "12px",
                          width: "200px",
                          background: "#083344",
                        }}
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenModal(test._id)}
                      >
                        <p className="poppins text-[13.5px] px-1.5 normal-case text-white">
                          View Top Rankings
                        </p>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <p>No tests available</p>
              )}
            </div>

            {/* Modal for displaying rankings */}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  width: "80vw",
                  maxHeight: "80vh",
                  minHeight: "80vh",
                  overflowY: "scroll",
                  justifyContent: "space-between",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="">
                  <h2 className="poppins2 text-[23px] text-[#083344]">
                    Top Rankings
                  </h2>
                  <div className="overflow-x-scroll h-[54%] mt-6">
                    <Table className="">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>S.No</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Register Number</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Email</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Submission Time</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Marks</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Malpractice</b>
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <b>Questions:</b>
                          </TableCell>
                          {uniqueQuestions.map((questionText, index) => (
                            <TableCell
                              key={index}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              <b>
                                {index + 1}. {questionText}
                              </b>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rankings && rankings.length > 0 ? (
                          rankings.map((ranking, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{ranking.registerNumber}</TableCell>
                              <TableCell>{ranking.email}</TableCell>
                              <TableCell>
                                {`${
                                  formatDateTime(
                                    ranking.submissionTime.toString()
                                  ).date
                                } ${
                                  formatDateTime(
                                    ranking.submissionTime.toString()
                                  ).time
                                }`}
                              </TableCell>
                              <TableCell>{ranking.marks}</TableCell>
                              <TableCell>
                                {ranking.malpractice === "true"
                                  ? "Malpractice"
                                  : "Genuine"}
                              </TableCell>
                              <TableCell></TableCell>
                              {uniqueQuestions.map((questionText, qIndex) => {
                                const answer = ranking.answers.find(
                                  (a) => a.questionText === questionText
                                );
                                return (
                                  <TableCell key={qIndex}>
                                    {answer ? answer.selectedAnswer : "N/A"}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6}>
                              No rankings available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex justify-end items-end">
                  <Button
                    onClick={handleCloseModal}
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: "20px", marginRight: "10px" }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="contained"
                    color="secondary"
                    sx={{ marginTop: "20px" }}
                  >
                    Download Excel
                  </Button>
                </div>
              </Box>
            </Modal>
          </div>
        </>
      )}
    </>
  );
};

export default Dashboard;
