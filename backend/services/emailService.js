const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (req, res) => {
  const { to, subject, text, html, filename, pdfBase64 } = req.body;
  const msg = {
    to,
    from: 'abhishek19980402@gmail.com',
    subject,
    text,
    html,
    attachments: [
      {
        content: pdfBase64,
        filename: filename || 'resume.pdf',
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ],
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error });
  }
};

module.exports = { sendEmail };
