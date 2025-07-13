require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

if (!process.env.DEEPSEEK_API_KEY) {
  console.error('Error: DEEPSEEK_API_KEY is missing from .env file');
  process.exit(1);
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

app.post('/generate', async (req, res) => {
  try {
    const { name, role, experience, skills } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const prompt = `Generate a professional resume for ${name} who is a ${role}. 
    Experience: ${experience || 'Not provided'}. 
    Skills: ${skills || 'Not provided'}.
    Include sections for Summary, Experience, Skills, and Education. 
    Format it professionally with clear section headings.`;

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-pi',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    const resumeContent = response.data.choices[0].message.content;
    res.send(resumeContent);

  } catch (error) {
    console.error('Error generating resume:', error);
    let errorMessage = 'Failed to generate resume';
    if (error.response) {
      errorMessage = error.response.data.error?.message || errorMessage;
    }
    res.status(500).json({ error: errorMessage });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});