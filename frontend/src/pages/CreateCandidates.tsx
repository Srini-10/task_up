import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { Spin } from "antd";

const CreateCandidates = () => {
  const [candidateData, setCandidateData] = useState({
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [candidatesList, setCandidatesList] = useState([]);
  const [editCandidateId, setEditCandidateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);

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
      setMessage("Register number already exists. Please use a unique number.");
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

      setMessage("candidate registered successfully!");
      fetchCandidates();
      resetForm();
    } catch (error) {
      setMessage("Error registering candidate. Please try again.");
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
      setMessage("Error fetching candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (candidateId) => {
    try {
      await axios.delete(
        `https://taskup-backend.vercel.app/api/testCandidates/${candidateId}`
      );
      setMessage("candidate deleted successfully!");
      fetchCandidates();
    } catch (error) {
      setMessage("Error deleting candidate.");
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
      `https://taskup-backend.vercel.app/uploads/${candidate.profilePicture}`
    );
    setEditCandidateId(candidate._id);
    setOpenEditModal(true);
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
        `https://taskup-backend.vercel.app/api/testCandidates/${editCandidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("candidate updated successfully!");
      fetchCandidates();

      // Reset the form and modal state
      resetForm();
      setOpenEditModal(false);
    } catch (error) {
      console.error(error.response || error.message);
      setMessage("Error updating candidate.");
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
        <>
          <Typography variant="h4" align="center" gutterBottom>
            Register candidate
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Register Number"
              name="registerNumber"
              value={candidateData.registerNumber}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Date of Birth"
              name="dob"
              value={candidateData.dob}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={candidateData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Phone"
              name="phone"
              value={candidateData.phone}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
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
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Register candidate
            </Button>
          </form>
          {message && (
            <Typography mt={2} color="error">
              {message}
            </Typography>
          )}
          {/* Display stored candidate details */}
          <Box mt={4}>
            <Typography variant="h5">Registered candidates</Typography>
            {candidatesList.length > 0 ? (
              candidatesList.map((candidate, index) => (
                <Box key={index} mb={2}>
                  <Typography>
                    Register Number: {candidate.registerNumber}
                  </Typography>
                  <Typography>DOB: {candidate.dob}</Typography>
                  <Typography>Email: {candidate.email}</Typography>
                  <Typography>Phone: {candidate.phone}</Typography>
                  {candidate.profilePicture && (
                    <img
                      src={`https://taskup-backend.vercel.app/uploads/${candidate.profilePicture}`}
                      alt="Profile"
                      width="100"
                    />
                  )}
                  <Box mt={2}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleEdit(candidate)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(candidate._id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              ))
            ) : (
              <Typography>No candidates registered yet.</Typography>
            )}
          </Box>
          {/* Edit Modal */}
          <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
            <DialogTitle>Edit candidate Details</DialogTitle>
            <DialogContent>
              <TextField
                label="Register Number"
                name="registerNumber"
                value={candidateData.registerNumber}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Date of Birth"
                name="dob"
                value={candidateData.dob}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                value={candidateData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                name="phone"
                value={candidateData.phone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
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
            </DialogContent>
            {message && (
              <Typography mt={2} color="error">
                {message}
              </Typography>
            )}
            <DialogActions>
              <Button onClick={() => setOpenEditModal(false)} color="primary">
                Cancel
              </Button>
              <Button onClick={handleUpdateCandidate} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default CreateCandidates;
