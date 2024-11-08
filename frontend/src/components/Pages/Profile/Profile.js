import React, { useState } from "react";
import "./Profile.css";

function Profile() {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    return (
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
    );
}

export default Profile;
