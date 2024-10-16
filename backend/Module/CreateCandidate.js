const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  registerNumber: String,
  dob: String,
  email: String,
  phone: String,
  profilePicture: String,
});

const CreateCandidate = mongoose.model("CreateCandidate", candidateSchema);
module.exports = CreateCandidate;
