import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import { useLocation, useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.passedId;
  console.log("id recieved from state", userId);

  const [profileData, setProfileData] = useState({
    fullName: "Abhishek",
    email: "onthewayabhishek@gmail.com",
    careerObjective: "To leverage my skills in software development.",
    skills: "JavaScript, React, Node.js, MongoDB",
    recentJob: "Frontend Developer at XYZ Corp",
    responsibilities: "Developing user-friendly applications",
    education: "B.S. in Computer Science",
    certifications: "JavaScript Developer Certification",
    yearsOfExperience: 5,
    proficiency: "React, Node.js, MongoDB",
    contact: "onthewayabhishek@gmail.com",
    userId: null,
    jobTitle: "Full-Stack Developer",
  });

  const showLogout = useRef(false);
  const showLogin = useRef(true);

  // Only useRef for values that are persistent but don't need to trigger re-renders
  const initialEmail = useRef("onthewayabhishek@gmail.com");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token available, skipping verification.");
        navigate("/");
      }
      await axios
        .get(
          `${process.env.REACT_APP_BACKEND_URI}/api/verification/verifyUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Send token in Authorization header
            },
          }
        )
        .then((response) => {
          initialEmail.current = response.data.email;
          showLogout.current = true;
          showLogin.current = false;
        })
        .catch((error) => {
          console.log("error=", error.message);
          showLogin.current = true;
          navigate("/");
        });
    }
    async function getData() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URI}/api/resume/profile`,
          {
            params: { email: initialEmail.current }, // Use the email from useRef
          }
        );
        console.log("response from getdata in profile page=", response);

        if (
          response.data.profile &&
          response.data.profile.length > 0 &&
          response.data.profile[0].userId
        ) {
          const profile = response.data.profile[0];
          setProfileData({
            fullName: profile.fullName || "",
            email: profile.email || "",
            careerObjective: profile.careerObjective || "",
            skills: profile.skills?.join(", ") || "", // Use optional chaining
            recentJob:
              "At " +
                profile.experience[0].company +
                " as a " +
                profile.experience[0].position || "",
            responsibilities: profile.experience[0].responsibilities || "",
            education:
              profile.education[0]?.degree +
                " From " +
                profile.education[0]?.institution || "", // Use optional chaining
            certifications: profile.certifications || "",
            yearsOfExperience: profile.yearsOfExperience || 0,
            proficiency: profile.proficiency || "", // Use optional chaining
            contact: profile.contactInfo.phoneNumber || "",
            userId: profile.userId || null,
            jobTitle: profile.jobTitle || null,
          });
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    }

    checkLogin();
    getData();
  }, [navigate]); // Empty array ensures it only runs once

  function handleJobs() {
    console.log(
      "values which are being passed are as follows:",
      profileData.userId,
      profileData.jobTitle,
      profileData.fullName,
      profileData.email
    );

    navigate("/jobs", {
      state: {
        userId: profileData.userId,
        jobTitle: profileData.jobTitle,
        name: profileData.fullName,
        storedEmail: profileData.email,
      },
    });
  }

  function onLogout() {
    localStorage.removeItem("token");
    showLogout.current = false;
    console.log("showlogout in onlogout=", showLogout.current);
    showLogin.current = true;
    console.log("showlogin in onlogout=", showLogin.current);
    navigate("/");
  }
  function onLogin() {
    navigate("/login");
  }
  console.log("showlogout in profile=", showLogout.current);

  return (
    <div className="main-profile-container">
      <Navbar
        pageName={"Profile"}
        username={profileData.fullName.split(' ')[0]}
        showJobs={true}
        handleJobs={handleJobs}
        showLogout={showLogout.current}
        onLogout={onLogout}
        showLogin={showLogin.current}
        onLogin={onLogin}
      />
      <div className="profile-container">
        <h2>Profile Page</h2>
        <form className="profile-form">
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
          />
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
          />
          <label>Career Objective:</label>
          <textarea
            name="careerObjective"
            value={profileData.careerObjective}
            onChange={handleChange}
          />
          <label>Skills:</label>
          <input
            type="text"
            name="skills"
            value={profileData.skills}
            onChange={handleChange}
          />
          <label>Recent Job:</label>
          <input
            type="text"
            name="recentJob"
            value={profileData.recentJob}
            onChange={handleChange}
          />
          <label>Responsibilities:</label>
          <textarea
            name="responsibilities"
            value={profileData.responsibilities}
            onChange={handleChange}
          />
          <label>Education:</label>
          <input
            type="text"
            name="education"
            value={profileData.education}
            onChange={handleChange}
          />
          <label>Certifications:</label>
          <input
            type="text"
            name="certifications"
            value={profileData.certifications}
            onChange={handleChange}
          />
          <label>Years of Experience:</label>
          <input
            type="text"
            name="yearsOfExperience"
            value={profileData.yearsOfExperience}
            onChange={handleChange}
          />
          <label>Proficiency:</label>
          <input
            type="text"
            name="proficiency"
            value={profileData.proficiency}
            onChange={handleChange}
          />
          <label>Contact:</label>
          <input
            type="text"
            name="contact"
            value={profileData.contact}
            onChange={handleChange}
          />
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
