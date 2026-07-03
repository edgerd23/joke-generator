// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const jokeContainer = document.getElementById('jokeContainer');
const jokeText = document.getElementById('jokeText');
const punchlineText = document.getElementById('punchlineText');
const revealBtn = document.getElementById('revealBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const categorySelect = document.getElementById('categorySelect');
const jokeList = document.getElementById('jokeList');

// State
let currentJoke = null;
let jokeHistory = [];
const MAX_HISTORY = 10;

// API: Using JokeAPI (https://jokeapi.dev/)
const API_BASE_URL = 'https://v2.jokeapi.dev/joke/';

// Event Listeners
getJokeBtn.addEventListener('click', fetchJoke);
revealBtn.addEventListener('click', revealPunchline);
categorySelect.addEventListener('change', resetDisplay);

// Fetch joke from API
async function fetchJoke() {
    const category = categorySelect.value;
    const endpoint = category === 'any' ? 'Any' : capitalizeFirst(category);

    // Keep things family-friendly unless the person deliberately picked Dark Humor
    const blacklist = category === 'dark' ? '' : '?blacklistFlags=nsfw,racist,sexist,religious,political';

    // Show loading state
    showLoading(true);
    hideError();
    hideJoke();
    getJokeBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}${blacklist}`);
        
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.message || `API Error: ${response.status}`);
        }
        
        // Store the joke
        currentJoke = {
            setup: data.setup || data.joke,
            delivery: data.delivery || null,
            type: data.type,
            category: data.category
        };
        
        displayJoke();
        addToHistory(currentJoke);
        
    } catch (error) {
        showError(error.message || 'Failed to fetch joke. Please check your internet connection.');
        console.error('Error fetching joke:', error);
    } finally {
        showLoading(false);
        getJokeBtn.disabled = false;
    }
}

// Display the current joke
function displayJoke() {
    jokeContainer.classList.remove('hidden');
    jokeText.textContent = currentJoke.setup;
    punchlineText.textContent = currentJoke.delivery || '';
    
    // Show reveal button only for two-part jokes
    if (currentJoke.type === 'twopart' && currentJoke.delivery) {
        punchlineText.classList.add('hidden');
        revealBtn.classList.remove('hidden');
    } else {
        punchlineText.classList.remove('hidden');
        revealBtn.classList.add('hidden');
    }
}

// Reveal punchline
function revealPunchline() {
    punchlineText.classList.remove('hidden');
    revealBtn.classList.add('hidden');
}

// Hide joke display
function hideJoke() {
    jokeContainer.classList.add('hidden');
}

// Reset display when category changes
function resetDisplay() {
    hideJoke();
    hideError();
}

// Show/hide loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show/hide error message
function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Add joke to history
function addToHistory(joke) {
    let displayText = joke.setup;
    if (joke.delivery) {
        displayText += ` ... ${joke.delivery}`;
    }
    
    const preview = displayText.length > 80
        ? displayText.substring(0, 80) + '...'
        : displayText;
    jokeHistory.unshift(preview);
    
    if (jokeHistory.length > MAX_HISTORY) {
        jokeHistory.pop();
    }
    
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    jokeList.innerHTML = '';
    
    jokeHistory.forEach((joke, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${joke}`;
        jokeList.appendChild(li);
    });
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
function init() {
    updateHistoryDisplay();
}

// Run initialization
init();
