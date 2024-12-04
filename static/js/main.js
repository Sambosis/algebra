// Global variables to store current problem
let currentProblem = null;
let hintsRemaining = 3;

// DOM Elements
const gradeSelect = document.getElementById('grade');
const problemText = document.getElementById('problem-text');
const answerInput = document.getElementById('answer-input');
const hintBtn = document.getElementById('hint-btn');
const submitBtn = document.getElementById('submit-btn');
const hintDisplay = document.getElementById('hint-display');
const resultDisplay = document.getElementById('result-display');
const explanationPanel = document.getElementById('explanation-panel');

// Function to fetch a new problem
async function fetchProblem() {
    try {
        const response = await fetch('/get_problem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grade: gradeSelect.value
            })
        });
        
        if (!response.ok) throw new Error('Failed to fetch problem');
        
        currentProblem = await response.json();
        displayProblem();
    } catch (error) {
        console.error('Error:', error);
        problemText.textContent = 'Error loading problem. Please try again.';
    }
}

// Function to display the current problem
function displayProblem() {
    if (!currentProblem) return;
    
    problemText.textContent = currentProblem.problem;
    answerInput.value = '';
    hintDisplay.classList.add('hidden');
    resultDisplay.classList.add('hidden');
    explanationPanel.classList.add('hidden');
}

// Function to check the answer
async function checkAnswer() {
    if (!currentProblem) return;
    
    try {
        const response = await fetch('/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answer: answerInput.value,
                correct_answer: currentProblem.correct_answer,
                explanation: currentProblem.explanation
            })
        });
        
        if (!response.ok) throw new Error('Failed to check answer');
        
        const result = await response.json();
        displayResult(result);
    } catch (error) {
        console.error('Error:', error);
        resultDisplay.textContent = 'Error checking answer. Please try again.';
        resultDisplay.classList.remove('hidden');
    }
}

// Function to display the result
function displayResult(result) {
    resultDisplay.classList.remove('hidden');
    explanationPanel.classList.remove('hidden');
    
    if (result.correct) {
        resultDisplay.textContent = 'Correct! Well done!';
        resultDisplay.style.backgroundColor = '#d4edda';
    } else {
        resultDisplay.textContent = 'Not quite right. Try again!';
        resultDisplay.style.backgroundColor = '#f8d7da';
    }
    
    explanationPanel.textContent = currentProblem.explanation;
}

// Function to show a hint
function showHint() {
    if (!currentProblem || hintsRemaining <= 0) return;
    
    hintDisplay.classList.remove('hidden');
    hintDisplay.textContent = currentProblem.hints[0]; // Show first hint for simplicity
    hintsRemaining--;
    hintBtn.textContent = `Hint (${hintsRemaining} remaining)`;
    
    if (hintsRemaining <= 0) {
        hintBtn.disabled = true;
    }
}

// Event Listeners
gradeSelect.addEventListener('change', fetchProblem);
submitBtn.addEventListener('click', checkAnswer);
hintBtn.addEventListener('click', showHint);

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    fetchProblem();
    hintBtn.textContent = `Hint (${hintsRemaining} remaining)`;
});