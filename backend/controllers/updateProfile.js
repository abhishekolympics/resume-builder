const Resume = require("../models/Resume");

const updateProfile = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    jobTitle,
    careerObjective,
    skills,
    recentJob,
    experience,
    education,
    certifications,
    yearsOfExperience,
    proficiency,
    projects,
    contactInfo,
  } = req.body;

  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (email) updateData.email = email;
  if (jobTitle) updateData.jobTitle = jobTitle;
  if (careerObjective) updateData.careerObjective = careerObjective;
  if (skills) updateData.skills = skills;
  if (recentJob) updateData.recentJob = recentJob;
  if (experience) updateData.experience = experience;
  if (education) updateData.education = education;
  if (certifications) updateData.certifications = certifications;
  if (yearsOfExperience) updateData.yearsOfExperience = yearsOfExperience;
  if (proficiency) updateData.proficiency = proficiency;
  if (projects) updateData.projects = projects;
  if (contactInfo) updateData.contactInfo = contactInfo;

  try {
    const updatedResume = await Resume.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedResume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(updatedResume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = updateProfile;
