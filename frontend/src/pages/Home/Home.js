import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import generateResumePDF from "../../components/utils/generatePdf";

import speakQuestion from "../../components/AI/speakQuestion";
import stopRecording from "../../components/AudioControls/StopRecording";
import startRecording from "../../components/AudioControls/StartRecording";
import cleanup from "../../components/utils/cleanup";
import RecordingGif from "../../assets/rec.gif";
import BotSpeaking from "../../assets/bot.gif";
import Navbar from "../../components/Navbar/Navbar";
import "./Home.css";
import { questions, maxRecordingTimes } from "../../constants/formQuestions";

const Home = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingResults, setProcessingResults] = useState([]);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const maxRecordingTimeoutRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const processingResultsRef = useRef(processingResults);

  const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

  const currentMaxTimeRef = useRef(0);
  const recordingStartedRef = useRef(false);
  const recordingStoppedRef = useRef(true);

  const currentQuestionRef = useRef(currentQuestion);
  const hasCalledCheckLogin = useRef(false);

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
      questions,
      processingResultsRef,
      setProcessingResults,
      setCurrentQuestion,
      setIsActive,
      speakQuestion,
      handleCompleteConversation,
      currentQuestion,
      currentMaxTimeRef,
      recordingStartedRef,
      recordingStoppedRef
    );
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
              {
                role: "system",
                content:
                  "You are a resume processing assistant. Format and organize the following user's resume data into JSON with the following fields: fullName, email, jobTitle, careerObjective, skills, recentJob, responsibilities, experience, education, certifications, yearsOfExperience, proficiency, projects, and contactInfo. If any information is missing, populate the field as an empty string (for text fields) or an empty array (for list fields). Ensure that these fields are not arrays: recentJob, responsibilities, certifications, yearsOfExperience, and proficiency. Populate the responsibilities field with the job duties that were provided. For the 'experience' field, include the subfields: 'company', 'position', 'startDate', 'endDate', and 'responsibilities'. Experience is an array because a person can work for more than 1 company with different positions and different start and end dates. For the 'education' field, include the subfields: 'degree' and 'institution'. Education is an array, because a person can have more than one degree. For the 'projects' field, include the subfields: 'projectName', 'description', and 'technologiesUsed'. For 'contactInfo', include 'phoneNumber' and 'EmailAddress'. **Ensure that 'recentJob' is a single string with job title and company name, 'proficiency' is a single string with software tools, careerObjective is a single string, certifications is a single string, email is a single string, fullName is a single string, jobTitle is a single string, responsibilities is a single string, yearsOfExperience is a single string.** **Also ensure skills is an string array, technologiesUsed is a string array.** **Experience is an array, education is an array, projects is an array.** Do not include any additional fields. Format the data exactly as described, with no extra information or fields.",
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
      generateResumePDF(structuredData, navigate);
    } catch (error) {
      console.error("Error refining data with OpenAI:", error);
    }
  };

  function handleOnLogin() {
    navigate("/login");
  }

  function checkLogin() {
    console.log("checking login creds");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token available, skipping verification.");
      return; // Skip the verification if there's no token
    }
    axios
      .get(`${process.env.REACT_APP_BACKEND_URI}/api/verification/verifyUser`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        withCredentials: true,
      })
      .then((response) => {
        console.log(
          "response in homepage for checkLogin=",
          response.data.email
        );

        axios
          .get(`${process.env.REACT_APP_BACKEND_URI}/api/resume/profile`, {
            params: { email: response.data.email }, // Use the email from useRef
          })
          .then((profileResponse) => {
            console.log(
              "profile recieved succesfully=",
              profileResponse.data.profile
            );

            const name = profileResponse.data.profile[0].fullName;
            const userId = profileResponse.data.profile[0]._id;
            const jobTitle = profileResponse.data.profile[0].jobTitle;
            const storedEmail = profileResponse.data.profile[0].email;
            navigate("/jobs", {
              state: {
                name,
                storedEmail,
                jobTitle,
                userId,
              },
            });
          });
      })
      .catch((error) => {
        localStorage.removeItem("token");
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

  // function onButtonClick() {
  //   const structuredData = {
  //     fullName: "John Doe",
  //     email: "johndoe@example.com",
  //     jobTitle: "Full Stack Developer",
  //     careerObjective: "Passionate about building scalable web applications and learning new technologies.",
  //     skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  //     recentJob: "Full Stack Developer at Tech Solutions Inc.",
  //     experience: [
  //       {
  //         company: "Tech Solutions Inc.",
  //         position: "Software Engineer",
  //         startDate: new Date("2022-01-01"),
  //         endDate: new Date("2023-12-31"),
  //         responsibilities: "Developed and maintained web applications using React and Node.js.",
  //       },
  //       {
  //         company: "WebWorks",
  //         position: "Junior Developer",
  //         startDate: new Date("2020-06-01"),
  //         endDate: new Date("2021-12-31"),
  //         responsibilities: "Assisted in developing front-end components with React.",
  //       },
  //     ],
  //     education: [
  //       {
  //         degree: "Bachelor of Science in Computer Science",
  //         institution: "University of California, Berkeley",
  //       },
  //       {
  //         degree: "Master of Science in Software Engineering",
  //         institution: "Stanford University",
  //       },
  //     ],
  //     certifications: "Certified JavaScript Developer from Udemy.com",
  //     yearsOfExperience: "3 years",
  //     proficiency: "Proficient in JavaScript, React, Node.js, MongoDB, Git, Docker.",
  //     projects: [
  //       {
  //         projectName: "Personal Portfolio",
  //         description: "A personal website to showcase my projects and skills.",
  //         technologiesUsed: ["HTML", "CSS", "JavaScript", "React"],
  //       },
  //       {
  //         projectName: "E-commerce App",
  //         description: "An e-commerce platform built using React and Node.js.",
  //         technologiesUsed: ["React", "Node.js", "MongoDB", "Express"],
  //       },
  //     ],
  //     contactInfo: {
  //       phoneNumber: "123-456-7890",
  //       emailAddress: "johndoe@example.com",
  //     },
  //   };

  //   console.log(structuredData);

  //   generateResumePDF(structuredData, navigate);
  // }

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
            {isBotSpeaking ? (
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
                <h3>
                  Timer:- {recordingTime}/
                  {Number(maxRecordingTimes[currentQuestion]) / 1000} sec
                </h3>
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
      {/* <button onClick={onButtonClick}>buttoner</button> */}
    </div>
  );
};

export default Home;
