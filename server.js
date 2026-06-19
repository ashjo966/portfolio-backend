const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow your GitHub Pages site to talk to this server
app.use(express.json()); // Allow the server to read your website's submission

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_GMAIL_ADDRESS@gmail.com',  // <-- Replace with your Gmail address
    pass: 'YOUR_16_CHAR_APP_PASSWORD'     // <-- Replace with Google App Password (no spaces)
  }
});

app.post('/send-resume', async (req, res) => {
  const { visitor_email } = req.body;

  if (!visitor_email) {
    return res.status(400).send({ success: false, message: 'Email is required' });
  }

  const mailOptions = {
    from: 'Ashwin Joshi <YOUR_GMAIL_ADDRESS@gmail.com>', // <-- Replace with your Gmail address
    to: visitor_email,
    subject: "Ashwin Joshi's resume",
    text: `Hi there,

Thanks for your interest! Please find attached my resume.

If you wish to contact me further, below are my coordinates:

Email: ashjo966@gmail.com (just reply to this email)

Phone: +91-9765161771

LinkedIn: https://www.linkedin.com/in/ashjoshi93/

Regards,
Ashwin Joshi`,
    attachments: [
      { 
        filename: 'AshwinJoshi_CV.pdf', 
        path: 'https://ashjo966.github.io/AshwinJoshi_CV.pdf' // <-- Correct direct PDF link
      } 
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ success: false, message: 'Failed to send email' });
  }
});

// START THE SERVER (Required for Render to work)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
