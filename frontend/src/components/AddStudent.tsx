// src/components/AddStudent.js
import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const AddStudent = ({ students, setStudents }) => {
  const [registerNumber, setRegisterNumber] = useState("");
  const [dob, setDob] = useState("");

  const handleAddStudent = () => {
    const newStudent = { registerNumber, dob };
    setStudents([...students, newStudent]);
    setRegisterNumber("");
    setDob("");
  };

  return (
    <Box mt={3}>
      <TextField
        label="Student Register Number"
        value={registerNumber}
        onChange={(e) => setRegisterNumber(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Date of Birth (dd/mm/yyyy)"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={handleAddStudent}
        color="primary"
        fullWidth
      >
        Add Student
      </Button>
    </Box>
  );
};

export default AddStudent;
