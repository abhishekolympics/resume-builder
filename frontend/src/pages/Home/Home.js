import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import speakQuestion from "../../components/AI/speakQuestion";
import stopRecording from "../../components/AudioControls/StopRecording";
import startRecording from "../../components/AudioControls/StartRecording";
import cleanup from "../../components/utils/cleanup";
import RecordingGif from "../../assets/rec.gif";
import BotSpeaking from "../../assets/bot.gif";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingResults, setProcessingResults] = useState([]);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const maxRecordingTimeoutRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const processingResultsRef = useRef(processingResults);
  console.log(recordingTime);

  const hasCalledCheckLogin = useRef(false);

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const questions = [
    "What is your full name?",
    "What job title are you aiming for?",
    "Could you briefly describe your career objective?",
    "What are your strongest skills related to this role?",
    "Where did you work most recently, and what was your role?",
    "What were your main responsibilities at your last job?",
    "Could you describe your educational background?",
    "What certifications or additional training do you have?",
    "How many years of experience do you have in your field?",
    "What software or tools are you proficient in?",
    "How can employers contact you (email, phone number)?",
  ];

  const maxRecordingTimes = [
    5000, // 20 seconds for "What is your full name?"
    5000, // 20 seconds for "What job title are you aiming for?"
    10000, // 25 seconds for "Could you briefly describe your career objective?"
    10000, // 30 seconds for "What are your strongest skills related to this role?"
    5000, // 30 seconds for "Where did you work most recently, and what was your role?"
    10000, // 35 seconds for "What were your main responsibilities at your last job?"
    15000, // 30 seconds for "Could you describe your educational background?"
    5000, // 25 seconds for "What certifications or additional training do you have?"
    5000, // 20 seconds for "How many years of experience do you have in your field?"
    10000, // 25 seconds for "What software or tools are you proficient in?"
    20000, // 20 seconds for "How can employers contact you (email, phone number)?"
  ];

  const currentQuestionRef = useRef(currentQuestion);

  // Stop recording and process audio
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestionRef, currentQuestion]);

  const startConversation = async () => {
    setIsActive(true);
    setCurrentQuestion(0);
    setProcessingResults([]);
    await speakQuestion(
      questions[0],
      setIsBotSpeaking,
      startRecording,
      audioChunksRef,
      mediaRecorderRef,
      setRecordingTime,
      recordingTimerRef,
      maxRecordingTimes,
      currentQuestionRef,
      maxRecordingTimeoutRef,
      stopRecording,
      cleanup,
      setIsRecording,
      questions,
      processingResultsRef,
      setProcessingResults,
      setCurrentQuestion,
      setIsActive,
      speakQuestion,
      handleCompleteConversation,
      currentQuestion
    );
  };

  const generateResumePDF = (data) => {
    const doc = new jsPDF();
    let y = 20;
    const pageHeight = doc.internal.pageSize.height - 20; // Bottom margin

    const checkPageOverflow = () => {
      if (y >= pageHeight) {
        doc.addPage();
        y = 20; // Reset Y position for new page
      }
    };

    // Set font size and add name and job title
    doc.setFontSize(22);
    doc.text(data.fullName, 20, y);
    y += 10;
    checkPageOverflow();

    doc.setFontSize(16);
    doc.text(data.jobTitle, 20, y);
    y += 15;
    checkPageOverflow();

    doc.setFontSize(12);

    // Career Objective (wrapped to fit within the page)
    const careerObjective = doc.splitTextToSize(
      `Career Objective: ${data.careerObjective}`,
      180
    );
    doc.text(careerObjective, 20, y);
    y += careerObjective.length * 6 + 5;
    checkPageOverflow();

    // Skills
    doc.text("Skills:", 20, y);
    y += 7;
    data.skills.forEach((skill) => {
      doc.text(`- ${skill}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;

    // Recent Job and Responsibilities
    if (data.recentJob) {
      doc.text(`Recent Job: ${data.recentJob.company || ""}`, 20, y);
      y += 7;
      checkPageOverflow();
      doc.text(`Position: ${data.recentJob.position || ""}`, 20, y);
      y += 7;
      checkPageOverflow();
      doc.text(
        `Start Date: ${data.recentJob.startDate || ""} - End Date: ${
          data.recentJob.endDate || "Present"
        }`,
        20,
        y
      );
      y += 10;
      checkPageOverflow();
    }

    if (data.responsibilities) {
      const responsibilities = doc.splitTextToSize(
        `Responsibilities: ${data.responsibilities}`,
        180
      );
      doc.text(responsibilities, 20, y);
      y += responsibilities.length * 6 + 5;
      checkPageOverflow();
    }

    // Experience
    if (Array.isArray(data.experience)) {
      doc.text("Experience:", 20, y);
      y += 7;
      checkPageOverflow();
      data.experience.forEach((exp) => {
        doc.text(`- Company: ${exp.company}`, 25, y);
        y += 7;
        checkPageOverflow();
        doc.text(`  Position: ${exp.position}`, 25, y);
        y += 7;
        checkPageOverflow();
        doc.text(
          `  Start Date: ${exp.startDate || "N/A"} - End Date: ${
            exp.endDate || "N/A"
          }`,
          25,
          y
        );
        y += 7;
        checkPageOverflow();
        const expResponsibilities = doc.splitTextToSize(
          `  Responsibilities: ${exp.responsibilities.join(", ")}`,
          180
        );
        doc.text(expResponsibilities, 25, y);
        y += expResponsibilities.length * 6 + 5;
        checkPageOverflow();
      });
    } else if (data.experience) {
      doc.text("Experience:", 20, y);
      y += 7;
      checkPageOverflow();
      doc.text(`- Company: ${data.experience.company}`, 25, y);
      y += 7;
      checkPageOverflow();
      doc.text(`  Position: ${data.experience.position}`, 25, y);
      y += 7;
      checkPageOverflow();
      doc.text(
        `  Start Date: ${data.experience.startDate || "N/A"} - End Date: ${
          data.experience.endDate || "N/A"
        }`,
        25,
        y
      );
      y += 7;
      checkPageOverflow();
      const expResponsibilities = doc.splitTextToSize(
        `  Responsibilities: ${data.experience.responsibilities.join(", ")}`,
        180
      );
      doc.text(expResponsibilities, 25, y);
      y += expResponsibilities.length * 6 + 5;
      checkPageOverflow();
    }
    y += 5;

    // Education
    if (Array.isArray(data.education)) {
      doc.text("Education:", 20, y);
      y += 7;
      checkPageOverflow();
      data.education.forEach((edu) => {
        doc.text(`- Degree: ${edu.degree}`, 25, y);
        y += 7;
        checkPageOverflow();
        doc.text(`  Institution: ${edu.institution}`, 25, y);
        y += 7;
        checkPageOverflow();
      });
    } else if (data.education) {
      doc.text("Education:", 20, y);
      y += 7;
      checkPageOverflow();
      doc.text(`- Degree: ${data.education.degree}`, 25, y);
      y += 7;
      checkPageOverflow();
      doc.text(`  Institution: ${data.education.institution}`, 25, y);
      y += 7;
      checkPageOverflow();
    }
    y += 5;

    // Certifications
    doc.text("Certifications:", 20, y);
    y += 7;
    checkPageOverflow();
    data.certifications.forEach((cert) => {
      doc.text(`- ${cert}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;

    // Years of Experience
    doc.text(`Years of Experience: ${data.yearsOfExperience}`, 20, y);
    y += 10;
    checkPageOverflow();

    // Proficiency
    doc.text("Software Proficiency:", 20, y);
    y += 7;
    checkPageOverflow();
    data.proficiency.forEach((prof) => {
      doc.text(`- ${prof}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 10;

    // Contact Information
    doc.text("Contact Information:", 20, y);
    y += 7;
    checkPageOverflow();
    doc.text(`Phone Number: ${data.contactInfo.phoneNumber || "N/A"}`, 25, y);
    y += 7;
    checkPageOverflow();
    doc.text(`Address: ${data.contactInfo.address || "N/A"}`, 25, y);

    // Convert to Base64 and send
    const pdfName = `${data.fullName.replace(/ /g, "_")}_Resume.pdf`;
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    fetch(`${process.env.REACT_APP_BACKEND_URI}/api/resume/save-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        pdfBase64,
        pdfName,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error saving resume:", error));

    fetch(`${process.env.REACT_APP_BACKEND_URI}/api/email/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: data.email,
        subject: "Your resume is ready.",
        text: "This email and the resume is generated by Ai resume generator.",
        html: "<strong>Well Hello there</strong>",
        filename: pdfName,
        pdfBase64,
      }),
    })
      .then((response) => response.json())
      .then((emailData) => console.log(emailData))
      .catch((error) => console.error("Error sending email:", error));

    navigate("/jobs", {
      state: {
        name: data.fullName,
        storedEmail: data.email,
        jobTitle: data.jobTitle,
      },
    });
  };

  const handleCompleteConversation = async (processingResultsRef) => {
    setIsActive(false);
    // Consolidate responses
    const consolidatedResponses = processingResultsRef.current
      .map((result) => `${result.question}: ${result.processed}`)
      .join("\n");

    console.log(
      "data which is given to chatgpt for extracting useful info=",
      consolidatedResponses
    );

    // Step 1: Send request to OpenAI for data refinement
    try {
      const refinedResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              // {
              //   role: "system",
              //   content:
              //     "Format and organize the following user's resume data into JSON fields with the following names: fullName, email, jobTitle, careerObjective, skills, recentJob, responsibilities, education, certifications, yearsOfExperience, proficiency, and contact. Ensure each field is accurately populated and, if any information is missing, leave it as an empty string.",
              // },
              {
                role: "system",
                content:
                  "Format and organize the following user's resume data into JSON fields with the following names: fullName, email, jobTitle, careerObjective, skills, recentJob, responsibilities, experience, education, certifications, yearsOfExperience, proficiency, projects, and contactInfo. If any information is missing, populate the field as an empty string or an empty array (for list fields). For experience, include 'company', 'position', 'startDate', 'endDate', and 'responsibilities'. For education, include 'degree' and 'institution'. For projects, include 'projectName', 'description', and 'technologiesUsed'. For contactInfo, include 'phoneNumber' and 'address'. Do not add extra fields. These fields shouldn't be an array -> recentJob, responsibilities, certifications, yearsOfExperience, proficiency. In responsibilites add the responsibilities which were given at the job. ",
              },
              {
                role: "user",
                content: consolidatedResponses,
              },
            ],
          }),
        }
      );

      const refinedData = await refinedResponse.json();
      console.log("refined Data from chatgpt side=", refinedData);
      const structuredData = JSON.parse(refinedData.choices[0].message.content);
      console.log("structured data from chatgpt side=", structuredData);

      // Pass structured data to generateResumePDF
      generateResumePDF(structuredData);
    } catch (error) {
      console.error("Error refining data with OpenAI:", error);
    }
  };

  function handleOnLogin() {
    navigate("/login");
  }

  async function checkLogin() {
    console.log("checking login creds");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token available, skipping verification.");
      return; // Skip the verification if there's no token
    }
    await axios
      .get(`${process.env.REACT_APP_BACKEND_URI}/api/verification/verifyUser`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        withCredentials: true,
      })
      .then(() => {
        navigate("/jobs");
      })
      .catch((error) => {
        console.log("error=", error);
      });
  }
  useEffect(() => {
    // Ensure that getJobs is called only once using the ref
    if (!hasCalledCheckLogin.current) {
      checkLogin();
      hasCalledCheckLogin.current = true;
    }
  });

  return (
    <div>
      <Navbar pageName={"Home"} />
      <div className="homePage">
        <h1>AI Resume Generator</h1>
        <div>
          <button onClick={startConversation} disabled={isActive}>
            Start Conversation
          </button>
        </div>

        {isActive && (
          <div>
            {isBotSpeaking && isRecording ? (
              <img
                src={BotSpeaking}
                alt="Bot is speaking"
                height={100}
                width={100}
              />
            ) : !isBotSpeaking ? (
              <div>
                <img
                  src={RecordingGif}
                  alt="recording is on"
                  height={100}
                  width={100}
                />
              </div>
            ) : (
              <p>Processing...</p>
            )}
          </div>
        )}
      </div>
      {!isActive && (
        <div className="homePage">
          <h3>Been here before?</h3>
          <button onClick={handleOnLogin}>LOGIN</button>
        </div>
      )}
    </div>
  );
};

export default Home;
