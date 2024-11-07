import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";

import speakQuestion from "./components/ai/speakQuestion";
import stopRecording from "./components/audio/stopRecording";
import startRecording from "./components/audio/startRecording";
import cleanup from './components/Utils/cleanup';

const App = () => {
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
  const processingResultsRef = useRef([]);

  const MAX_RECORDING_TIME = 10000; // 2 seconds maximum recording time
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
    7000, // 35 seconds for "What were your main responsibilities at your last job?"
    10000, // 30 seconds for "Could you describe your educational background?"
    5000, // 25 seconds for "What certifications or additional training do you have?"
    5000, // 20 seconds for "How many years of experience do you have in your field?"
    5000, // 25 seconds for "What software or tools are you proficient in?"
    20000, // 20 seconds for "How can employers contact you (email, phone number)?"
  ];

  const currentQuestionRef = useRef(currentQuestion);

  // Stop recording and process audio
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestionRef]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const generateResumePDF = (data) => {
    // console.log("Generate Resume is called.");
    const doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(22);
    doc.text(data.fullName, 20, 20);
    doc.setFontSize(16);
    doc.text(data.jobTitle, 20, 30);
    doc.setFontSize(12);
    doc.text(`Career Objective: ${data.careerObjective}`, 20, 50);
    doc.text(`Skills: ${data.skills}`, 20, 60);
    doc.text(`Recent Job: ${data.recentJob}`, 20, 70);
    doc.text(`Responsibilities: ${data.responsibilities}`, 20, 80);
    doc.text(`Education: ${data.education}`, 20, 90);
    doc.text(`Certifications: ${data.certifications}`, 20, 100);
    doc.text(`Years of Experience: ${data.yearsOfExperience}`, 20, 110);
    doc.text(`Software Proficiency: ${data.proficiency}`, 20, 120);
    doc.text(`Contact: ${data.contact}`, 20, 130);

    const pdfName = `${data.fullName.replace(/ /g, "_")}_Resume.pdf`;
    // pdfName.save();

    // Convert the PDF to Base64
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    console.log("data inside generate resume=", data);

    // Send the data to the backend for saving and emailing
    fetch("http://localhost:5000/api/resume/save-resume", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        careerObjective: data.careerObjective,
        skills: data.skills,
        recentJob: data.recentJob,
        responsibilities: data.responsibilities,
        education: data.education,
        certifications: data.certifications,
        yearsOfExperience: data.yearsOfExperience,
        proficiency: data.proficiency,
        contact: data.contact,
        pdfBase64: pdfBase64,
        pdfName: pdfName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error("Error saving resume:", error));

    console.log("data.email in generateResumePdf=", data.email);

    // After saving, send the resume via email
    fetch("http://localhost:5000/api/email/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: data.email, // Email the resume to the user
        subject: "Your resume is ready.",
        text: "This email and the resume is generated by Ai resume generator.",
        html: "<strong>Well Hello there</strong>",
        filename: pdfName,
        pdfBase64: pdfBase64, // Attach the PDF base64
      }),
    })
      .then((response) => response.json())
      .then((emailData) => console.log(emailData))
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  };

  const handleCompleteConversation = async (processingResultsRef) => {
    // Consolidate responses
    const consolidatedResponses = processingResultsRef.current
      .map((result) => `${result.question}: ${result.processed}`)
      .join("\n");

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
              {
                role: "system",
                content:
                  "Format and organize the following user's resume data into JSON fields with the following names: fullName, email, jobTitle, careerObjective, skills, recentJob, responsibilities, education, certifications, yearsOfExperience, proficiency, and contact. Ensure each field is accurately populated and, if any information is missing, leave it as an empty string.",
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
      const structuredData = JSON.parse(refinedData.choices[0].message.content);

      // Pass structured data to generateResumePDF
      generateResumePDF(structuredData);
    } catch (error) {
      console.error("Error refining data with OpenAI:", error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          AI Conversation Assistant
        </h1>

        <div className="flex justify-center mb-6">
          <button
            onClick={startConversation}
            disabled={isActive}
            className={`px-6 py-2 rounded-lg font-semibold text-white ${
              isActive ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } disabled:opacity-50 transition-colors`}
          >
            Start Conversation
          </button>
        </div>

        {isActive && (
          <div className="text-center p-4 bg-gray-100 rounded-lg mb-6">
            {isBotSpeaking ? (
              <p className="text-blue-500">AI is speaking...</p>
            ) : isRecording ? (
              <div>
                <p className="text-red-500">Recording...</p>
                <p className="text-lg font-mono">{formatTime(recordingTime)}</p>
                <p className="text-sm text-gray-500">
                  (Will automatically stop after silence or{" "}
                  {MAX_RECORDING_TIME / 1000} seconds)
                </p>
              </div>
            ) : (
              <p>Processing...</p>
            )}
          </div>
        )}

        {processingResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Conversation Summary</h2>
            <div className="space-y-4">
              {processingResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <p className="font-bold">Q: {result.question}</p>
                  <p className="mt-2 text-gray-600">A: {result.answer}</p>
                  <p className="mt-2 font-semibold">Key Information:</p>
                  <p className="text-gray-800">{result.processed}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
