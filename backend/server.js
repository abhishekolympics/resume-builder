// const express = require('express');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config(); 
// const emailSender = require('./emailSender');
// const Resume = require('./models/Resume');

// const app = express();

// app.use(cors()); 
// app.use(express.json());
// app.use(bodyParser.json()); 
// app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect(process.env.MONGODB_URI)
// .then(() => {
//     console.log('Connected to MongoDB');
// })
// .catch((error) => {
//     console.error('MongoDB connection error:', error);
// });

// app.get('/', (req, res) => {
//     res.send('Welcome to the Resume Builder API!');
// });

// app.use('/api', emailSender);

// app.post('/api/save-resume', async (req, res) => {
//     try {
//       const resumeData = req.body;
//       console.log("resumeData in save-resume api=",resumeData);
  
//       // Create a new resume entry in the database
//       const newResume = new Resume(resumeData);
  
//       // Save the resume to the database
//       await newResume.save();
  
//       res.status(200).json({ message: 'Resume saved successfully', resume: newResume });
//     } catch (error) {
//       res.status(500).json({ message: 'Error saving resume', error: error });
//     }
//   });

// app.post('/api/profile', (req, res) => {
//     const { name, email, skills } = req.body;
//     res.status(201).json({
//         message: 'Profile created successfully!',
//         profile: {
//             name,
//             email,
//             skills,
//         },
//     });
// });

// app.post('/generate-resume', async (req, res) => {
//     try {
//         const data = req.body;
//         await generateResumePDF(data); // Call the PDF generation function
//         res.status(200).send('Resume generated successfully!');
//     } catch (error) {
//         res.status(500).send('Error generating resume: ' + error.message);
//     }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to the database
connectDB();

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/resume', resumeRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the Resume Builder API!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
