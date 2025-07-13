// script.js - Frontend logic for Resume Builder
const resumeForm = document.getElementById('resumeForm');
const generateBtn = document.getElementById('generateBtn');
const resumeOutput = document.getElementById('resumeOutput');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const errorContainer = document.getElementById('errorContainer');

// Initialize event listeners
function init() {
  resumeForm.addEventListener('submit', handleFormSubmit);
  copyBtn.addEventListener('click', copyResume);
  downloadBtn.addEventListener('click', downloadResume);
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  errorContainer.classList.add('hidden');

  const formData = new FormData(resumeForm);
  const userData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const { resume } = await response.json();
    displayResume(resume);
  } catch (error) {
    showError(error.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Resume';
  }
}

// Display generated resume
function displayResume(resumeText) {
  resumeOutput.textContent = resumeText;
  resumeOutput.classList.remove('hidden');
  copyBtn.classList.remove('hidden');
  downloadBtn.classList.remove('hidden');
}

// Copy resume to clipboard
function copyResume() {
  navigator.clipboard.writeText(resumeOutput.textContent)
    .then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      showError('Failed to copy resume: ' + err.message);
    });
}

// Download resume as text file
function downloadResume() {
  const blob = new Blob([resumeOutput.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resume.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Show error message
function showError(message) {
  errorContainer.textContent = message;
  errorContainer.classList.remove('hidden');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);