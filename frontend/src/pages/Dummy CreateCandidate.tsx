import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { Input, Popconfirm, Modal, Spin } from "antd";
import { showToast } from "../toastUtil";

const CreateCandidates = () => {
  const [candidateData, setCandidateData] = useState({
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [message, showToast] = useState("");
  const [candidatesList, setCandidatesList] = useState([]);
  const [editCandidateId, setEditCandidateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    setCandidateData({
      ...candidateData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile picture change and preview
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the register number already exists
    const isRegisterNumberExists = candidatesList.some(
      (candidate) => candidate.registerNumber === candidateData.registerNumber
    );

    if (isRegisterNumberExists) {
      showToast("Register number already exists. Please use a unique number.");
      return;
    }

    const formData = new FormData();
    formData.append("registerNumber", candidateData.registerNumber);
    formData.append("dob", candidateData.dob);
    formData.append("email", candidateData.email);
    formData.append("phone", candidateData.phone);
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      await axios.post(
        "https://taskup-backend.vercel.app/api/testCandidates",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast("candidate registered successfully!");
      fetchCandidates();
      resetForm();
    } catch (error) {
      showToast("Error registering candidate. Please try again.");
    }
  };

  // Fetch all candidates from the server
  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://taskup-backend.vercel.app/api/testCandidates"
      );
      setCandidatesList(response.data);
    } catch (error) {
      showToast("Error fetching candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId) => {
    try {
      await axios.delete(
        `https://taskup-backend.vercel.app /api/testCandidates/${candidateId}`
      );
      showToast("candidate deleted successfully!");
      fetchCandidates();
    } catch (error) {
      showToast("Error deleting candidate.");
    }
  };

  // Edit candidate
  const handleEdit = (candidate) => {
    setCandidateData({
      registerNumber: candidate.registerNumber,
      dob: candidate.dob,
      email: candidate.email,
      phone: candidate.phone,
    });
    setProfilePreview(
      `https://taskup-backend.vercel.app /uploads/${candidate.profilePicture}`
    );
    setEditCandidateId(candidate._id);
    setIsModalVisible(true);
  };

  const handleUpdateCandidate = async () => {
    const formData = new FormData();
    formData.append("registerNumber", candidateData.registerNumber);
    formData.append("dob", candidateData.dob);
    formData.append("email", candidateData.email);
    formData.append("phone", candidateData.phone);

    // Append the profile picture only if a new one is selected
    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    }

    try {
      await axios.put(
        `https://taskup-backend.vercel.app /api/testCandidates/${editCandidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast("candidate updated successfully!");
      fetchCandidates();

      // Reset the form and modal state
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      console.error(error.response || error.message);
      showToast("Error updating candidate.");
    }
  };

  // Reset form and image preview
  const resetForm = () => {
    setCandidateData({ registerNumber: "", dob: "", email: "", phone: "" });
    setProfilePicture(null);
    setProfilePreview(null);
    setEditCandidateId(null);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="z-50 top-0 left-0 w-full h-full flex justify-center items-center">
          <Spin size="large" className="custom-spin" />
        </div>
      ) : (
        <div className="flex justify-between items-start p-6 gap-6">
          <div className="w-full h-full">
            <Box>
              <h1 className="text-[23px] poppins2 text-[#083344]">
                Candidates List
              </h1>

              <div className="grid grid-cols-2 gap-4">
                {candidatesList.length > 0 ? (
                  candidatesList.map((candidate, index) => (
                    <div className="bg-slate-100 border-[1.5px] border-slate-200 p-3 rounded-lg">
                      <h1 className="text-[15px] text-[#083344] font-semibold flex gap-1">
                        Register Number:
                        <p className="font-medium text-gray-500">
                          {candidate.registerNumber}
                        </p>
                      </h1>

                      <h1 className="text-[15px] text-[#083344] font-semibold flex gap-1">
                        DOB:
                        <p className="font-medium text-gray-500">
                          {candidate.dob}
                        </p>
                      </h1>

                      <h1 className="text-[15px] text-[#083344] font-semibold flex gap-1">
                        Email:
                        <p className="font-medium text-gray-500">
                          {candidate.email}
                        </p>
                      </h1>

                      <h1 className="text-[15px] text-[#083344] font-semibold flex gap-1">
                        Phone:
                        <p className="font-medium text-gray-500">
                          {candidate.phone}
                        </p>
                      </h1>
                      {candidate.profilePicture && (
                        <img
                          src={`https://taskup-backend.vercel.app/uploads/${candidate.profilePicture}`}
                          alt="Profile"
                          width="100"
                        />
                      )}
                      <Box mt={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ marginRight: "10px" }}
                          onClick={() => handleEdit(candidate)}
                        >
                          <ion-icon name="create-outline" />
                        </Button>
                        <Popconfirm
                          title="Are you sure to delete this question?"
                          onClick={() => handleDelete(candidate._id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button variant="contained" color="error">
                            <ion-icon name="trash-outline" />
                          </Button>
                        </Popconfirm>
                      </Box>
                    </div>
                  ))
                ) : (
                  <Typography>No candidates registered yet.</Typography>
                )}
              </div>
            </Box>
            <Modal
              title="Edit Candidate Details"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              onOk={handleUpdateCandidate}
              okText="Save"
              cancelText="Cancel"
            >
              <Input
                placeholder="Register Number"
                name="registerNumber"
                value={candidateData.registerNumber}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Date of Birth"
                name="dob"
                value={candidateData.dob}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Email"
                name="email"
                value={candidateData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Phone"
                name="phone"
                value={candidateData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />

              <Input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ marginTop: "10px" }}
              />
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Preview"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    marginTop: "10px",
                  }}
                />
              )}
            </Modal>
          </div>
          <div className="min-w-[400px] max-w-[400px] bg-[#a5c4ca] rounded-lg p-4">
            <h1 className="text-[23px] poppins2 mb-4 text-[#083344]">
              Register candidate
            </h1>
            <form onSubmit={handleSubmit}>
              <Input
                placeholder="Register Number"
                name="registerNumber"
                value={candidateData.registerNumber}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Date of Birth"
                name="dob"
                value={candidateData.dob}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Email"
                name="email"
                value={candidateData.email}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Input
                placeholder="Phone"
                name="phone"
                value={candidateData.phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
                className="h-[40px] mt-2"
              />
              <Box mt={2} mb={2}>
                <Typography variant="body1">Upload Profile Picture:</Typography>
                <input type="file" onChange={handleProfilePictureChange} />
              </Box>
              {profilePreview && (
                <Box mt={2} mb={2}>
                  <img src={profilePreview} alt="Profile Preview" width="100" />
                </Box>
              )}
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Register candidate
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCandidates;
