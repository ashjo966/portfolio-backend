const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow your GitHub Pages site to talk to this server
app.use(express.json()); // Allow the server to read your website's submission

app.post('/send-resume', async (req, res) => {
  const { visitor_email } = req.body;

  if (!visitor_email) {
    return res.status(400).send({ success: false, message: 'Email is required' });
  }

  try {
   // Send email using Brevo's HTTP API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY, // <-- Read key securely from Render
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Ashwin Joshi',
          email: 'ashjo966@gmail.com' // <-- Must match your verified sender email in Brevo
        },
        to: [
          {
            email: visitor_email
          }
        ],
        subject: "Ashwin Joshi's resume",
        textContent: `Hi there,

Thanks for your interest! Please find attached my resume.

If you wish to contact me further, below are my coordinates:

Email: ashjo966@gmail.com (just reply to this email)

Phone: +91-9765161771

LinkedIn: https://www.linkedin.com/in/ashjoshi93/

Regards,
Ashwin Joshi`,
        attachment: [
          {
            url: 'https://ashjo966.github.io/AshwinJoshi_CV.pdf', // Direct CV link
            name: 'AshwinJoshi_CV.pdf'
          }
        ]
      })
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).send({ success: true, message: 'Email sent successfully!' });
    } else {
      console.error('Brevo API Error:', data);
      res.status(500).send({ success: false, message: data.message || 'Failed to send email' });
    }

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
