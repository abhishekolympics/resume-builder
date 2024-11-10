import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Profile.css";
import Navbar from "../../Utils/Navbar";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
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
  });

  const showLogout = useRef(false);

  // Only useRef for values that are persistent but don't need to trigger re-renders
  const initialEmail = useRef("oonthewayabhishek@gmail.com");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  async function checkLogin() {
    const token = localStorage.getItem("token");
    const response = await axios
      .get("http://localhost:5000/api/verification/verifyUser", {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      })
      .then(() => {
        showLogout.current = true;
      })
      .catch((error) => {
        console.log("error=", error);
      });
  }
  checkLogin();

  useEffect(() => {
    async function getData() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/resume/profile",
          {
            params: { email: initialEmail.current }, // Use the email from useRef
          }
        );
        console.log("response from getdata in profile page=", response);

        if (response.data.profile && response.data.profile.length > 0) {
          const profile = response.data.profile[0];
          setProfileData({
            fullName: profile.fullName || "",
            email: profile.email || "",
            careerObjective: profile.careerObjective || "",
            skills: profile.skills.join(", ") || "",
            recentJob: profile.recentJob || "",
            responsibilities: profile.responsibilities || "",
            education: profile.education.join(", ") || "",
            certifications: profile.certifications || "",
            yearsOfExperience: profile.yearsOfExperience || 0,
            proficiency: profile.proficiency.join(", ") || "",
            contact: profile.contact || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    }

    getData();
  }, []); // Empty array ensures it only runs once

  function handleJobs() {
    navigate("/jobs");
  }

  function onLogout() {
    localStorage.removeItem('token');
    showLogout.current=false;
  }

  return (
    <div className="main-profile-container">
      <Navbar pageName={"Profile"} showJobs={true} handleJobs={handleJobs} showLogout={showLogout.current} onLogout={onLogout} />
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
            type="number"
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
