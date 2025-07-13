<<<<<<< HEAD
import { apiConfig } from './config.js';
import { showNotification } from './notifications.js';
import { validateInput } from './validation.js';

class InteractiveApp {
  constructor() {
    this.initElements();
    this.initEventListeners();
    this.state = {
      isLoading: false,
      data: null,
      error: null
    };
  }

  initElements() {
    this.form = document.getElementById('data-form');
    this.input = document.getElementById('data-input');
    this.submitBtn = document.getElementById('submit-btn');
    this.resultsContainer = document.getElementById('results-container');
    this.loader = document.getElementById('loader');
  }

  initEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.input.addEventListener('input', this.handleInputChange.bind(this));
    window.addEventListener('resize', this.handleWindowResize.bind(this));
  }

  async handleSubmit(e) {
    e.preventDefault();
    const inputValue = this.input.value.trim();

    if (!validateInput(inputValue)) {
      showNotification('Invalid input format', 'error');
      return;
    }

    try {
      this.setState({ isLoading: true, error: null });
      const data = await this.fetchData(inputValue);
      this.setState({ data, isLoading: false });
      this.renderResults(data);
      showNotification('Data loaded successfully', 'success');
    } catch (error) {
      console.error('API Error:', error);
      this.setState({ error, isLoading: false });
      showNotification('Failed to load data', 'error');
    }
  }

  handleInputChange() {
    if (this.state.error) {
      this.setState({ error: null });
    }
  }

  handleWindowResize() {
    if (this.state.data) {
      this.renderResults(this.state.data);
    }
  }

  async fetchData(query) {
    const response = await fetch(`${apiConfig.baseUrl}/data?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.toggleLoader();
  }

  toggleLoader() {
    this.loader.style.display = this.state.isLoading ? 'block' : 'none';
    this.submitBtn.disabled = this.state.isLoading;
  }

  renderResults(data) {
    if (!data || !data.results) {
      this.resultsContainer.innerHTML = '<p>No results found</p>';
      return;
    }

    const isMobile = window.innerWidth < 768;
    const resultsHTML = data.results.map(item => `
      <div class="result-item ${isMobile ? 'mobile' : ''}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="meta">${new Date(item.date).toLocaleDateString()}</div>
      </div>
    `).join('');

    this.resultsContainer.innerHTML = resultsHTML;
  }

  destroy() {
    this.form.removeEventListener('submit', this.handleSubmit);
    this.input.removeEventListener('input', this.handleInputChange);
    window.removeEventListener('resize', this.handleWindowResize);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new InteractiveApp();

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.destroy());
  }
});
=======
// This file is no longer needed as all functionality is in index.html
// Keeping as placeholder for future modular development
>>>>>>> 34f0724 (Assistant checkpoint: Fix server response and clean up code)
