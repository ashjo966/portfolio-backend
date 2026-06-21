const express = require('express');
const cors = require('cors');
const fs = require('fs');
const xlsx = require('xlsx');

const app = express();
app.use(cors()); // Allow your GitHub Pages site to talk to this server
app.use(express.json()); // Allow the server to read your website's submission

// Helper function to append email log to Excel file
function appendToExcel(email, datetime) {
  const filePath = './Portfolio_email.xlsx';
  let workbook;
  let worksheet;
  let data = [];

  if (fs.existsSync(filePath)) {
    try {
      workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    } catch (e) {
      console.error('Error reading existing Excel file, creating new one:', e);
      workbook = xlsx.utils.book_new();
    }
  } else {
    workbook = xlsx.utils.book_new();
  }

  data.push({
    'Email address': email,
    'DateTime': datetime
  });

  const newWorksheet = xlsx.utils.json_to_sheet(data);
  if (workbook.SheetNames.length === 0) {
    xlsx.utils.book_append_sheet(workbook, newWorksheet, 'Sheet1');
  } else {
    workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
  }
  
  xlsx.writeFile(workbook, filePath);
}

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
      // Log the email and current time in IST (local logs on server)
      const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const formattedDate = formatter.format(new Date()).replace(',', '');

      appendToExcel(visitor_email, formattedDate);

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

// GET logs from Excel
app.get('/get-emails', (req, res) => {
  const filePath = './Portfolio_email.xlsx';
  if (fs.existsSync(filePath)) {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      
      // Map data properties to expected frontend structure
      const logs = data.map(row => ({
        email: row['Email address'] || row['email'] || '',
        datetime: row['DateTime'] || row['datetime'] || ''
      }));

      res.status(200).json({ success: true, data: logs });
    } catch (error) {
      console.error('Error reading Excel file:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(200).json({ success: true, data: [] });
  }
});

// Download the Excel log file
app.get('/download-excel', (req, res) => {
  const filePath = './Portfolio_email.xlsx';
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'Portfolio_email.xlsx');
  } else {
    res.status(404).send('Excel file not found');
  }
});

// START THE SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
