import { jsPDF } from 'jspdf';


const generateResumePDF = ({ data, navigate }) => {
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
  if (Array.isArray(data.skills)) {
    doc.text("Skills:", 20, y);
    y += 7;
    data.skills.forEach((skill) => {
      doc.text(`- ${skill}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;
  } else if (data.skills) {
    doc.text(`Skills: ${data.skills || ""}`, 20, y);
    y += 7;
    checkPageOverflow();
  }

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
        `  Responsibilities: ${exp.responsibilities}`,
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
      `  Responsibilities: ${data.experience.responsibilities}`,
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
  if (Array.isArray(data.certifications)) {
    doc.text("Certifications:", 20, y);
    y += 7;
    checkPageOverflow();
    data.certifications.forEach((cert) => {
      doc.text(`- ${cert}`, 25, y);
      y += 7;
      checkPageOverflow();
    });
    y += 5;
  } else if (data.certifications) {
    doc.text(`  Certifications: ${data.certifications}`, 25, y);
    y += 7;
    checkPageOverflow();
  }

  // Years of Experience
  doc.text(`Years of Experience: ${data.yearsOfExperience}`, 20, y);
  y += 10;
  checkPageOverflow();

  // Proficiency
  doc.text(`Software Proficiency:", ${data.proficiency}`, 20, y);
  y += 7;
  checkPageOverflow();

  // Contact Information
  doc.text("Contact Information:", 20, y);
  y += 7;
  checkPageOverflow();
  doc.text(`Phone Number: ${data.contactInfo.phoneNumber || "N/A"}`, 25, y);
  y += 7;
  checkPageOverflow();
  doc.text(`Email Address: ${data.contactInfo.emailAddress || "N/A"}`, 25, y);

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

export default generateResumePDF;
