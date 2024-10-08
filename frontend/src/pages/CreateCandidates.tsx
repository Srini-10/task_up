import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";

const CreateCandidates = () => {
  const [candidateData, setcandidateData] = useState({
    registerNumber: "",
    dob: "",
    email: "",
    phone: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null); // For previewing image
  const [message, setMessage] = useState("");
  const [candidatesList, setCandidatesList] = useState([]);
  const [editcandidateId, setEditcandidateId] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    setcandidateData({
      ...candidateData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle profile picture change and preview
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setProfilePreview(URL.createObjectURL(file)); // Show image preview
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
      return; // Prevent form submission
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
      await axios.post("http://localhost:20000/api/testCandidates", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("candidate registered successfully!");
      fetchCandidates(); // Fetch updated candidates list
      resetForm(); // Reset the form after submission
    } catch (error) {
      setMessage("Error registering candidate. Please try again.");
    }
  };

  // Fetch all candidates from the server
  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:20000/api/testCandidates"
      );
      setCandidatesList(response.data);
    } catch (error) {
      setMessage("Error fetching candidates.");
    }
  };

  const handleDelete = async (candidateId) => {
    try {
      await axios.delete(
        `http://localhost:20000/api/testCandidates/${candidateId}`
      );
      setMessage("candidate deleted successfully!");
      fetchCandidates();
    } catch (error) {
      setMessage("Error deleting candidate.");
    }
  };

  // Edit candidate
  const handleEdit = (candidate) => {
    setcandidateData({
      registerNumber: candidate.registerNumber,
      dob: candidate.dob,
      email: candidate.email,
      phone: candidate.phone,
    });
    setProfilePreview(
      `http://localhost:20000/uploads/${candidate.profilePicture}`
    );
    setEditcandidateId(candidate._id);
    setOpenEditModal(true);
  };

  const handleUpdatecandidate = async () => {
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
        `http://localhost:20000/api/testCandidates/${editcandidateId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("candidate updated successfully!");
      fetchCandidates(); // Fetch updated candidates list

      // Reset the form and modal state
      resetForm();
      setOpenEditModal(false); // Close the modal after successful update
    } catch (error) {
      console.error(error.response || error.message);
      setMessage("Error updating candidate.");
    }
  };

  // Reset form and image preview
  const resetForm = () => {
    setcandidateData({ registerNumber: "", dob: "", email: "", phone: "" });
    setProfilePicture(null);
    setProfilePreview(null);
    setEditcandidateId(null);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <Container maxWidth="sm">
      <Link to="/">
        <Button>Back</Button>
      </Link>
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
                  src={`http://localhost:20000/uploads/${candidate.profilePicture}`}
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
          <Button onClick={handleUpdatecandidate} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateCandidates;
