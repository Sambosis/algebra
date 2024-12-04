document.addEventListener('DOMContentLoaded', function() {
    let currentProblem = null;
    let hintsRemaining = 3;

    // DOM Elements
    const gradeSelect = document.getElementById('grade');
    const problemDisplay = document.getElementById('problem-display');
    const answerInput = document.getElementById('answer-input');
    const hintBtn = document.getElementById('hint-btn');
    const submitBtn = document.getElementById('submit-btn');
    const explanationPanel = document.getElementById('explanation-panel');
    const solutionSteps = document.getElementById('solution-steps');
    const progressDisplay = document.getElementById('progress-display');

    // Event Listeners
    gradeSelect.addEventListener('change', loadNewProblem);
    submitBtn.addEventListener('click', checkAnswer);
    hintBtn.addEventListener('click', showHint);

    // Load a new problem when grade level changes
    async function loadNewProblem() {
        const gradeLevel = gradeSelect.value;
        try {
            const response = await fetch('/get_problem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grade_level: gradeLevel })
            });
            currentProblem = await response.json();
            displayProblem(currentProblem);
        } catch (error) {
            console.error('Error loading problem:', error);
            problemDisplay.textContent = 'Error loading problem. Please try again.';
        }
    }

    // Display the current problem
    function displayProblem(problem) {
        problemDisplay.textContent = problem.question;
        explanationPanel.classList.add('hidden');
        answerInput.value = '';
    }

    // Check the submitted answer
    async function checkAnswer() {
        if (!currentProblem) return;

        const answer = answerInput.value.trim();
        try {
            const response = await fetch('/check_answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problem_id: currentProblem.id,
                    answer: answer
                })
            });
            const result = await response.json();
            showResult(result);
        } catch (error) {
            console.error('Error checking answer:', error);
        }
    }

    // Show the result and explanation
    function showResult(result) {
        explanationPanel.classList.remove('hidden');
        solutionSteps.innerHTML = '';
        
        if (result.steps) {
            result.steps.forEach(step => {
                const stepElement = document.createElement('p');
                stepElement.textContent = step;
                solutionSteps.appendChild(stepElement);
            });
        }

        // Update local storage progress
        updateProgress(result.correct);
    }

    // Show a hint
    function showHint() {
        if (hintsRemaining > 0 && currentProblem && currentProblem.hints) {
            const hintIndex = 3 - hintsRemaining;
            if (currentProblem.hints[hintIndex]) {
                alert(currentProblem.hints[hintIndex]);
                hintsRemaining--;
                hintBtn.textContent = `Hint (${hintsRemaining} left)`;
            }
        }
        
        if (hintsRemaining === 0) {
            hintBtn.disabled = true;
        }
    }

    // Update progress in local storage
    function updateProgress(correct) {
        let progress = JSON.parse(localStorage.getItem('algebraProgress') || '{}');
        const gradeLevel = gradeSelect.value;
        
        if (!progress[gradeLevel]) {
            progress[gradeLevel] = { correct: 0, total: 0 };
        }
        
        progress[gradeLevel].total++;
        if (correct) {
            progress[gradeLevel].correct++;
        }
        
        localStorage.setItem('algebraProgress', JSON.stringify(progress));
        displayProgress(progress[gradeLevel]);
    }

    // Display progress
    function displayProgress(gradeProgress) {
        if (gradeProgress) {
            const percentage = ((gradeProgress.correct / gradeProgress.total) * 100).toFixed(1);
            progressDisplay.textContent = `Correct: ${gradeProgress.correct}/${gradeProgress.total} (${percentage}%)`;
        }
    }

    // Load initial problem
    loadNewProblem();
});