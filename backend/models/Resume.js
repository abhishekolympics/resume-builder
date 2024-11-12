const mongoose = require("mongoose");

// Define the schema for the resume data
const resumeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    jobTitle: { type: String },
    careerObjective: { type: String },
    skills: { type: [String] },
    recentJob: { type: String },
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        responsibilities: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
      },
    ],
    certifications: { type: String },
    yearsOfExperience: { type: String },
    proficiency: { type: String },
    projects: [
      {
        projectName: String,
        description: String,
        technologiesUsed: [String],
      },
    ],
    contactInfo: {
      phoneNumber: String,
      emailAddress: String,
    },
  },
  { timestamps: true }
);

// Create a model using the schema
const Resume = mongoose.model("Resume", resumeSchema);

module.exports = Resume;
