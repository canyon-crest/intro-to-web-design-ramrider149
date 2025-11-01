let score, answer, level, userName;
let roundStartTime, roundEndTime;
let hintsRemaining = 3;
let hintsUsed = [];
const levelArr = document.getElementsByName("level");
const scoreArr = [];
const timeArr = []; // stores time taken for each game in milliseconds
let timerInterval;

// Initialize date and time
updateDateTime();
setInterval(updateDateTime, 1000); // Update every second

// Event listeners
document.getElementById("setNameBtn").addEventListener("click", setName);
document.getElementById("nameInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        setName();
    }
});
playBtn.addEventListener("click", play); 
guessBtn.addEventListener("click", makeGuess);
giveUp.addEventListener("click", giveUpGame);
hintBtn.addEventListener("click", useHint);
document.getElementById("guess").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        makeGuess();
    }
});

// Function to get ordinal suffix for dates
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

// Function to update date and time
function updateDateTime() {
    let d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    
    let month = months[d.getMonth()];
    let day = d.getDate();
    let year = d.getFullYear();
    let suffix = getOrdinalSuffix(day);
    
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, '0');
    let seconds = d.getSeconds().toString().padStart(2, '0');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    let dateStr = `${month} ${day}${suffix}, ${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
    date.textContent = dateStr;
}

// Function to properly case a name
function properCase(name) {
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Function to set user name
function setName() {
    let inputName = document.getElementById("nameInput").value.trim();
    
    if (inputName === "") {
        alert("Please enter a name!");
        return;
    }
    
    userName = properCase(inputName);
    welcomeMsg.textContent = `Welcome, ${userName}!`;
    document.getElementById("nameInput").disabled = true;
    document.getElementById("setNameBtn").disabled = true;
    playBtn.disabled = false;
    msg.textContent = `${userName}, select a level and click Play!`;
}

// Function to start a new game
function play() {
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    giveUp.disabled = false;
    hintBtn.disabled = false;
    tempHint.textContent = "";
    hintMsg.textContent = "";
    
    // Reset hints
    hintsRemaining = 3;
    hintsUsed = [];
    document.getElementById("hintCount").textContent = hintsRemaining;
    
    for (let i = 0; i < levelArr.length; i++) {
        levelArr[i].disabled = true;
        if (levelArr[i].checked) {
            level = parseInt(levelArr[i].value);
        }
    }
    
    answer = Math.floor(Math.random() * level) + 1;
    msg.textContent = `${userName}, guess a number 1-${level}`;
    score = 0;
    
    // Start round timer
    roundStartTime = new Date().getTime();
    startRoundTimer();
}

// Function to start and display round timer
function startRoundTimer() {
    timerInterval = setInterval(() => {
        let currentTime = new Date().getTime();
        let elapsedTime = Math.floor((currentTime - roundStartTime) / 1000);
        let minutes = Math.floor(elapsedTime / 60);
        let seconds = elapsedTime % 60;
        roundTimer.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Function to stop round timer
function stopRoundTimer() {
    clearInterval(timerInterval);
    roundEndTime = new Date().getTime();
    let timeTaken = roundEndTime - roundStartTime;
    timeArr.push(timeTaken);
    return timeTaken;
}

// Function to use a hint
function useHint() {
    if (hintsRemaining <= 0) {
        hintMsg.textContent = "No hints remaining!";
        return;
    }
    
    hintsRemaining--;
    document.getElementById("hintCount").textContent = hintsRemaining;
    
    if (hintsRemaining === 0) {
        hintBtn.disabled = true;
    }
    
    // Generate different types of hints
    let availableHints = [];
    
    // Hint 1: Odd or Even
    if (!hintsUsed.includes("oddeven")) {
        availableHints.push({
            type: "oddeven",
            text: answer % 2 === 0 ? "The number is EVEN 🟦" : "The number is ODD 🔷"
        });
    }
    
    // Hint 2: Range hint (narrow down to half)
    if (!hintsUsed.includes("range")) {
        let midpoint = Math.floor(level / 2);
        availableHints.push({
            type: "range",
            text: answer <= midpoint 
                ? `The number is in the LOWER half (1-${midpoint}) 📉`
                : `The number is in the UPPER half (${midpoint + 1}-${level}) 📈`
        });
    }
    
    // Hint 3: Divisibility
    if (!hintsUsed.includes("divisibility")) {
        if (answer % 5 === 0) {
            availableHints.push({
                type: "divisibility",
                text: "The number is divisible by 5 ➗"
            });
        } else if (answer % 3 === 0) {
            availableHints.push({
                type: "divisibility",
                text: "The number is divisible by 3 ➗"
            });
        } else if (answer % 2 === 0) {
            availableHints.push({
                type: "divisibility",
                text: "The number is divisible by 2 (it's even) ➗"
            });
        } else {
            availableHints.push({
                type: "divisibility",
                text: "The number is NOT divisible by 2, 3, or 5 ❌"
            });
        }
    }
    
    // Hint 4: Greater or less than specific number
    if (!hintsUsed.includes("comparison") && level >= 10) {
        let comparePoint = Math.floor(level * 0.5);
        availableHints.push({
            type: "comparison",
            text: answer > comparePoint 
                ? `The number is GREATER than ${comparePoint} ⬆️`
                : `The number is LESS than or equal to ${comparePoint} ⬇️`
        });
    }
    
    // Select a random available hint
    if (availableHints.length > 0) {
        let randomHint = availableHints[Math.floor(Math.random() * availableHints.length)];
        hintsUsed.push(randomHint.type);
        hintMsg.textContent = `💡 Hint: ${randomHint.text}`;
    } else {
        hintMsg.textContent = "💡 Hint: You're on your own now! All unique hints used.";
    }
    
    // Add small penalty to score for using hint
    score += 0.5;
}

// Function to get temperature hint
function getTemperatureHint(userGuess) {
    let difference = Math.abs(userGuess - answer);
    let percentDiff = (difference / level) * 100;
    
    if (percentDiff <= 5) {
        return "🔥 BURNING HOT! You're extremely close!";
    } else if (percentDiff <= 15) {
        return "🌡️ HOT! Getting very warm!";
    } else if (percentDiff <= 30) {
        return "☀️ Warm! You're in the right area!";
    } else if (percentDiff <= 50) {
        return "🌤️ Cool. You're a bit far.";
    } else {
        return "❄️ FREEZING COLD! Way off!";
    }
}

// Function to evaluate score quality
function evaluateScore(score, level) {
    let ratio = score / level;
    
    if (ratio <= 0.3) {
        return "EXCELLENT";
    } else if (ratio <= 0.5) {
        return "GOOD";
    } else if (ratio <= 0.7) {
        return "OK";
    } else if (ratio <= 1.0) {
        return "FAIR";
    } else {
        return "NEEDS IMPROVEMENT";
    }
}

// Function to make a guess
function makeGuess() {
    let userGuess = parseInt(guess.value);
    
    if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
        msg.textContent = `${userName}, INVALID! Guess a number between 1 and ${level}!`;
        return;
    }
    
    score++;
    
    if (userGuess < answer) {
        msg.textContent = `${userName}, TOO LOW! GUESS AGAIN`;
        tempHint.textContent = getTemperatureHint(userGuess);
    } else if (userGuess > answer) {
        msg.textContent = `${userName}, TOO HIGH! GUESS AGAIN`;
        tempHint.textContent = getTemperatureHint(userGuess);
    } else {
        let timeTaken = stopRoundTimer();
        let timeInSeconds = (timeTaken / 1000).toFixed(1);
        let scoreQuality = evaluateScore(score, level);
        let hintPenalty = 3 - hintsRemaining;
        
        msg.textContent = `${userName}, CORRECT! The answer was ${answer}. It took you ${score} tries in ${timeInSeconds} seconds. Hints used: ${hintPenalty}. Score: ${scoreQuality}!`;
        tempHint.textContent = "";
        reset();
        updateScore();
        updateTimeStats();
    }
    
    guess.value = "";
    guess.focus();
}

// Function to give up
function giveUpGame() {
    if (confirm(`${userName}, are you sure you want to give up?`)) {
        stopRoundTimer();
        score = level; // Set score to the range (worst possible score)
        msg.textContent = `${userName} gave up! The answer was ${answer}. Your score: ${score} (gave up)`;
        tempHint.textContent = "";
        hintMsg.textContent = "";
        reset();
        updateScore();
        updateTimeStats();
    }
}

// Function to reset game controls
function reset() {
    guessBtn.disabled = true;
    giveUp.disabled = true;
    hintBtn.disabled = true;
    guess.value = "";
    guess.disabled = true;
    playBtn.disabled = false;
    roundTimer.textContent = "";
    
    for (let i = 0; i < levelArr.length; i++) {
        levelArr[i].disabled = false;
    }
}

// Function to update score statistics
function updateScore() {
    scoreArr.push(score);
    wins.textContent = scoreArr.length;
    
    let sum = 0;
    let sortedScores = [...scoreArr].sort((a, b) => a - b);
    
    // Update leaderboard with best (lowest) scores
    const lb = document.getElementsByName("leaderboard");
    for (let i = 0; i < lb.length; i++) {
        if (i < sortedScores.length) {
            lb[i].textContent = sortedScores[i];
        } else {
            lb[i].textContent = "-";
        }
    }
    
    // Calculate average score
    for (let i = 0; i < scoreArr.length; i++) {
        sum += scoreArr[i];
    }
    let avg = sum / scoreArr.length;
    avgScore.textContent = avg.toFixed(2);
}

// Function to update time statistics
function updateTimeStats() {
    if (timeArr.length === 0) return;
    
    // Find fastest game
    let fastest = Math.min(...timeArr);
    let fastestSeconds = (fastest / 1000).toFixed(1);
    fastestGame.textContent = `${fastestSeconds}s`;
    
    // Calculate average time
    let totalTime = timeArr.reduce((sum, time) => sum + time, 0);
    let avgTimeMs = totalTime / timeArr.length;
    let avgTimeSeconds = (avgTimeMs / 1000).toFixed(1);
    avgTime.textContent = `${avgTimeSeconds}s`;
}