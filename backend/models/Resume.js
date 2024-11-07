const mongoose = require('mongoose');

// Define the schema for the resume data
const resumeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  careerObjective: { type: String, required: true },
  skills: { type: [String], required: true },
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    responsibilities: [String]
  }],
  education: [{
    degree: String,
    institution: String,
  }],
  projects: [{
    projectName: String,
    description: String,
    technologiesUsed: [String]
  }],
  contactInfo: {
    phoneNumber: String,
    address: String
  }
}, { timestamps: true });

// Create a model using the schema
const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
