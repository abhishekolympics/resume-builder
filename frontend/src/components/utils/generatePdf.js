import { jsPDF } from "jspdf";

const generateResumePDF = (structuredData, navigate) => {
  console.log(
    "structuredData inside generateResumePDF function = ",
    structuredData
  );

  const sanitizedData = {
    fullName: structuredData.fullName || "Not Provided",
    email: structuredData.email || "Not Provided",
    jobTitle: structuredData.jobTitle || "Not Provided",
    careerObjective: structuredData.careerObjective || "Not Provided",
    skills:
      Array.isArray(structuredData.skills) && structuredData.skills.length > 0
        ? structuredData.skills
        : ["Not Provided"],
    experience:
      Array.isArray(structuredData.experience) &&
      structuredData.experience.length > 0
        ? structuredData.experience
        : [
            {
              company: "Not Provided",
              position: "Not Provided",
              responsibilities: "Not Provided",
              startDate: "Not Provided",
              endDate: "Not Provided",
            },
          ],
    education:
      Array.isArray(structuredData.education) &&
      structuredData.education.length > 0
        ? structuredData.education
        : [
            {
              degree: "Not Provided",
              institution: "Not Provided",
              startDate: "Not Provided",
              endDate: "Not Provided",
            },
          ],
    projects:
      Array.isArray(structuredData.projects) &&
      structuredData.projects.length > 0
        ? structuredData.projects
        : [
            {
              name: "Not Provided",
              description: "Not Provided",
              startDate: "Not Provided",
              endDate: "Not Provided",
            },
          ],
    certifications: structuredData.certifications || "Not Provided",
    contactInfo: {
      emailAddress:
        structuredData.contactInfo?.emailAddress ||
        structuredData.contactInfo?.EmailAddress ||
        "Not Provided",
      phoneNumber: structuredData.contactInfo?.phoneNumber || "Not Provided",
    },
    recentJob: structuredData.recentJob || "Not Provided",
    responsibilities: structuredData.responsibilities || "Not Provided",
    proficiency: structuredData.proficiency || "Not Provided",
    yearsOfExperience: structuredData.yearsOfExperience || "Not Provided",
  };

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
  doc.text(sanitizedData.fullName, 20, y);
  y += 10;
  checkPageOverflow();

  doc.setFontSize(16);
  doc.text(sanitizedData.jobTitle, 20, y);
  y += 15;
  checkPageOverflow();

  doc.setFontSize(12);

  // Career Objective (wrapped to fit within the page)
  const careerObjective = doc.splitTextToSize(
    `Career Objective: ${sanitizedData.careerObjective}`,
    180
  );
  doc.text(careerObjective, 20, y);
  y += careerObjective.length * 6 + 5;
  checkPageOverflow();

  // Skills
  if (Array.isArray(sanitizedData.skills)) {
    doc.text("Skills:", 20, y);
    y += 7;
    sanitizedData.skills.forEach((skill) => {
      doc.text(`- ${skill}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;
  } else if (sanitizedData.skills) {
    doc.text(`Skills: ${sanitizedData.skills || ""}`, 20, y);
    y += 7;
    checkPageOverflow();
  }

  // Recent Job and Responsibilities
  if (sanitizedData.recentJob) {
    doc.text(`Recent Job: ${sanitizedData.recentJob.company || ""}`, 20, y);
    y += 7;
    checkPageOverflow();
    doc.text(`Position: ${sanitizedData.recentJob.position || ""}`, 20, y);
    y += 7;
    checkPageOverflow();
    doc.text(
      `Start Date: ${sanitizedData.recentJob.startDate || ""} - End Date: ${
        sanitizedData.recentJob.endDate || "Present"
      }`,
      20,
      y
    );
    y += 10;
    checkPageOverflow();
  }

  if (sanitizedData.responsibilities) {
    const responsibilities = doc.splitTextToSize(
      `Responsibilities: ${sanitizedData.responsibilities}`,
      180
    );
    doc.text(responsibilities, 20, y);
    y += responsibilities.length * 6 + 5;
    checkPageOverflow();
  }

  // Experience
  if (Array.isArray(sanitizedData.experience)) {
    doc.text("Experience:", 20, y);
    y += 7;
    checkPageOverflow();
    sanitizedData.experience.forEach((exp) => {
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
      exp.startDate = new Date(exp.startDate);
      exp.endDate = new Date(exp.endDate);
      y += 7;
      checkPageOverflow();
      const expResponsibilities = doc.splitTextToSize(
        `  Responsibilities: ${exp.responsibilities}`,
        180
      );
      doc.text(expResponsibilities, 25, y);
      y += expResponsibilities.length * 6 + 5;
      checkPageOverflow();
    });
  } else if (sanitizedData.experience) {
    doc.text("Experience:", 20, y);
    y += 7;
    checkPageOverflow();
    doc.text(`- Company: ${sanitizedData.experience.company}`, 25, y);
    y += 7;
    checkPageOverflow();
    doc.text(`  Position: ${sanitizedData.experience.position}`, 25, y);
    y += 7;
    checkPageOverflow();
    doc.text(
      `  Start Date: ${
        sanitizedData.experience.startDate || "N/A"
      } - End Date: ${sanitizedData.experience.endDate || "N/A"}`,
      25,
      y
    );
    y += 7;
    checkPageOverflow();
    const expResponsibilities = doc.splitTextToSize(
      `  Responsibilities: ${sanitizedData.experience.responsibilities}`,
      180
    );
    doc.text(expResponsibilities, 25, y);
    y += expResponsibilities.length * 6 + 5;
    checkPageOverflow();
  }
  y += 5;

  // Education
  if (Array.isArray(sanitizedData.education)) {
    doc.text("Education:", 20, y);
    y += 7;
    checkPageOverflow();
    sanitizedData.education.forEach((edu) => {
      doc.text(`- Degree: ${edu.degree}`, 25, y);
      y += 7;
      checkPageOverflow();
      doc.text(`  Institution: ${edu.institution}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
  } else if (sanitizedData.education) {
    doc.text("Education:", 20, y);
    y += 7;
    checkPageOverflow();
    doc.text(`- Degree: ${sanitizedData.education.degree}`, 25, y);
    y += 7;
    checkPageOverflow();
    doc.text(`  Institution: ${sanitizedData.education.institution}`, 25, y);
    y += 7;
    checkPageOverflow();
  }
  y += 5;

  // Certifications
  if (Array.isArray(sanitizedData.certifications)) {
    doc.text("Certifications:", 20, y);
    y += 7;
    checkPageOverflow();
    sanitizedData.certifications.forEach((cert) => {
      doc.text(`- ${cert}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;
  } else if (sanitizedData.certifications) {
    doc.text(`  Certifications: ${sanitizedData.certifications}`, 25, y);
    y += 7;
    checkPageOverflow();
  }

  // Years of Experience
  doc.text(`Years of Experience: ${sanitizedData.yearsOfExperience}`, 20, y);
  y += 10;
  checkPageOverflow();

  // Proficiency
  doc.text(`Software Proficiency:", ${sanitizedData.proficiency}`, 20, y);
  y += 7;
  checkPageOverflow();

  // Contact Information
  doc.text("Contact Information:", 20, y);
  y += 7;
  checkPageOverflow();
  doc.text(
    `Phone Number: ${sanitizedData.contactInfo.phoneNumber || "N/A"}`,
    25,
    y
  );
  y += 7;
  checkPageOverflow();
  doc.text(
    `Email Address: ${sanitizedData.contactInfo.emailAddress || "N/A"}`,
    25,
    y
  );

  // Convert to Base64 and send
  const pdfName = `${sanitizedData.fullName.replace(/ /g, "_")}_Resume.pdf`;
  const pdfBase64 = doc.output("datauristring").split(",")[1];

  sanitizedData.experience.startDate = new Date(
    sanitizedData.experience.startDate
  );
  sanitizedData.experience.endDate = new Date(sanitizedData.experience.endDate);

  fetch(`${process.env.REACT_APP_BACKEND_URI}/api/resume/save-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...sanitizedData,
      pdfBase64,
      pdfName,
    }),
  })
    .then((response) => response.json())
    .then((sanitizedData) => console.log(sanitizedData))
    .catch((error) => console.error("Error saving resume:", error));

  fetch(`${process.env.REACT_APP_BACKEND_URI}/api/email/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: sanitizedData.email,
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
      name: sanitizedData.fullName,
      storedEmail: sanitizedData.email,
      jobTitle: sanitizedData.jobTitle,
    },
  });
};

export default generateResumePDF;
