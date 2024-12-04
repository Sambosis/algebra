from flask import Flask, render_template, request, jsonify
import json
import os
import random
from pathlib import Path

app = Flask(__name__)

# Load problems from JSON file
def load_problems():
    problems_file = Path("data/problems.json")
    if problems_file.exists():
        with open(problems_file, "r") as f:
            return json.load(f)
    return {}

# Route for main page
@app.route("/")
def index():
    return render_template("index.html")

# Route for getting a new problem
@app.route("/get_problem", methods=["POST"])
def get_problem():
    grade = request.json.get("grade", "7")
    problems = load_problems()
    if grade in problems and problems[grade]:
        problem = random.choice(problems[grade])
        return jsonify(problem)
    return jsonify({"error": "No problems found for this grade level"})

# Route for checking answers
@app.route("/check_answer", methods=["POST"])
def check_answer():
    data = request.json
    user_answer = data.get("answer")
    correct_answer = data.get("correct_answer")
    
    # Basic answer validation - you can make this more sophisticated
    is_correct = str(user_answer).strip() == str(correct_answer).strip()
    
    return jsonify({
        "correct": is_correct,
        "explanation": data.get("explanation", "")
    })

if __name__ == "__main__":
    app.run(debug=True)