const Resume = require('../models/Resume');

const saveResume = async (req, res) => {
  try {
    const resumeData = req.body;
    const newResume = new Resume(resumeData);
    await newResume.save();
    res.status(200).json({ message: 'Resume saved successfully', resume: newResume });
  } catch (error) {
    res.status(500).json({ message: 'Error saving resume', error });
  }
};

module.exports = { saveResume };
