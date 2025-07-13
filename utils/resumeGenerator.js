Here's the complete `resumeGenerator.js` file:

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

if (!DEEPSEEK_API_KEY) {
  throw new Error('DeepSeek API key is missing. Please add DEEPSEEK_API_KEY to your .env file');
}

const generateResumeSection = async (sectionType, userData) => {
  try {
    const prompt = createPrompt(sectionType, userData);
    
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
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating resume section:', error);
    throw new Error(`Failed to generate ${sectionType} section: ${error.message}`);
  }
};

const createPrompt = (sectionType, userData) => {
  const { name, role, experiences, skills, education } = userData;
  
  const sectionPrompts = {
    summary: `Create a professional summary for ${name}, a ${role}. Highlight key skills and experiences. Keep it concise (3-4 sentences).`,
    experience: `Generate 3-4 bullet points for each work experience: ${JSON.stringify(experiences)}. Focus on achievements and quantifiable results.`,
    skills: `List 8-12 technical and soft skills for ${name} based on these: ${skills.join(', ')}. Group them logically.`,
    education: `Format this education information professionally: ${JSON.stringify(education)}. Include degrees, institutions, and years.`,
    projects: `Suggest 2-3 impressive projects for a ${role} based on these skills: ${skills.join(', ')}. Include project names, descriptions, and technologies used.`
  };

  return sectionPrompts[sectionType] || `Generate content for the ${sectionType} section of a resume for ${name}, a ${role}.`;
};

const generateFullResume = async (userData) => {
  try {
    const sections = ['summary', 'experience', 'skills', 'education', 'projects'];
    const resume = {};

    for (const section of sections) {
      resume[section] = await generateResumeSection(section, userData);
    }

    return formatResume(resume, userData);
  } catch (error) {
    console.error('Error generating full resume:', error);
    throw new Error(`Failed to generate resume: ${error.message}`);
  }
};

const formatResume = (resumeSections, userData) => {
  const { name, email, phone, linkedin } = userData;
  
  return `
    ${name.toUpperCase()}
    ${email} | ${phone} | ${linkedin}
    
    SUMMARY
    ${resumeSections.summary}
    
    EXPERIENCE
    ${resumeSections.experience}
    
    SKILLS
    ${resumeSections.skills}
    
    EDUCATION
    ${resumeSections.education}
    
    PROJECTS
    ${resumeSections.projects}
  `;
};

export { generateFullResume, generateResumeSection };