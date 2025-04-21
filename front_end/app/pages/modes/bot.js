var gamePage = document.querySelector("game-page");
if (!gamePage || !gamePage.shadowRoot) {
    console.error("GamePage not found!");
    // return;
}

var canvas = gamePage.shadowRoot.querySelector("#pong");
if (!canvas) {
    console.error("Canvas not found!");
    // return;
}

var context = canvas.getContext("2d");




function startCountdown(callback) {
    var countdownOverlay = gamePage.shadowRoot.querySelector("#countdown-overlay");
    var countdownText = gamePage.shadowRoot.querySelector("#countdown-text");

    var countdownMessages = ["Ready", "Set", "GOO!"];
    var index = 0;

    function nextMessage() {
        if (index < countdownMessages.length) {
            countdownText.textContent = countdownMessages[index];
            index++;
            setTimeout(nextMessage, 1500); 
        } else {
            countdownOverlay.style.display = "none"; 
            callback(); 
        }
    }

    countdownOverlay.style.display = "flex";

    setTimeout(nextMessage, 1000);
}


function fetchUserData() {

fetch("/player_management/get_user_data/", {
    method: "GET",
    credentials: "include"
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {

        if (!gamePage || !gamePage.shadowRoot) {
            console.error("gamePage or shadowRoot is not available.");
            return;
        }

        var usernameElement = gamePage.shadowRoot.querySelector(".username");
        var avatarElement = gamePage.shadowRoot.querySelector(".user1_img");

        if (usernameElement) {
            usernameElement.textContent = data.username;
        }

        if (avatarElement) {
            avatarElement.src = data.avatar || "/assets/default-avatar.png"; 
        }
    })
    .catch(error => console.error("Error fetching user data:", error));
}


fetchUserData();
startCountdown(() => {
    gameLoop();
});


function fetchMatchData() {

fetch("/player_management/get_match_data/", {
    method: "GET",
    credentials: "include"
})
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
    })
    .catch(error => console.error("Error fetching user data:", error));
}


function getCSRFToken() {
var csrfToken = document.cookie.match(/csrftoken=([^ ;]+)/);
return csrfToken ? csrfToken[1] : null;
}


function postMatchHistory(winner, loser, score, game_mode, super_user, playersArray) {
var matchData = {
    winner: winner,
    loser: loser,
    mainUser: super_user,
    score: score,
    game_mode: game_mode,
    super_user: super_user,
    players: playersArray.map(player => player.trim()) // ----
};


fetch("/player_management/match-history/", {
    method: "POST",
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()
    },
    body: JSON.stringify(matchData)
})
.then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(`Server error: ${response.status} - ${err.message || "Unknown error"}`);
        });
    }
    return response.json();
})
.then(data => {
    // console.log("Match history posted successfully:", data);
    // matchHistory = data;
})
.catch(error => console.error("Error posting match history:", error));
}

document.addEventListener("DOMContentLoaded", () => {
var homeButton = document.getElementById("home-button");

if (homeButton) {
    homeButton.addEventListener("click", () => {
        var event = new CustomEvent("gameEnded", { bubbles: true, composed: true });
        document.dispatchEvent(event);
    });
} else {
    console.error("Home button not found!");
}
});

function drawRoundedRect(x, y, width, height, radius) {
context.beginPath();
context.moveTo(x + radius, y);
context.lineTo(x + width - radius, y);
context.quadraticCurveTo(x + width, y, x + width, y + radius);
context.lineTo(x + width, y + height - radius);
context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
context.lineTo(x + radius, y + height);
context.quadraticCurveTo(x, y + height, x, y + height - radius);
context.lineTo(x, y + radius);
context.quadraticCurveTo(x, y, x + radius, y);
context.closePath();
context.fill();
}


var paddleWidth = 10, paddleHeight = 100;
var leftPaddleY = (canvas.height - paddleHeight) / 2;
var rightPaddleY = (canvas.height - paddleHeight) / 2;


var ballRadius = 10;
var ballX = canvas.width / 2;
var ballY = canvas.height / 2;
var ballSpeedX = 8;
var ballSpeedY = 6;


var upArrow = false, downArrow = false;


var playerScore = 0;
var aiScore = 0;

var gameOver = false;

var aiMaxHeight = 400;

function gameLoop() {
if (!gameOver) {
    moveBall();
    movePaddles();
    detectCollisions();
    render();
    requestAnimationFrame(gameLoop);
}
}
// gamePage.shadowRoot.querySelector("#pong")

function updateScoreDashes() {
// var playerDashes = document.getElementById('player-dashes').children;
// var aiDashes = document.getElementById('ai-dashes').children;

var playerDashes = gamePage.shadowRoot.querySelector("#player-dashes").children;
var aiDashes = gamePage.shadowRoot.querySelector("#ai-dashes").children;

Array.from(playerDashes).forEach(dash => dash.classList.remove('active'));
Array.from(aiDashes).forEach(dash => dash.classList.remove('active'));

for (var i = 2; i < playerScore + 2; i++) {
    if (playerDashes[i] && playerDashes[i].classList.contains('dash')) {
        playerDashes[i].classList.add('active');
    }
}
for (var i = 0; i < aiScore; i++) {
    aiDashes[i].classList.add('active');
}
}

function moveBall() {
    if (gameOver) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 9)
        ballY += 2;
    if (ballY >= 392)
        ballY -= 2;

    if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballSpeedX > 0) {
        const timeToReachPaddle = (canvas.width - paddleWidth - ballX) / ballSpeedX;
        const predictedY = ballY + ballSpeedY * timeToReachPaddle;

        if (predictedY < 0) {
            const timeToTopWall = -ballY / ballSpeedY;
            const remainingTime = timeToReachPaddle - timeToTopWall;
            const predictedYAfterBounce = ballSpeedY * remainingTime;
            moveRightPaddle(predictedYAfterBounce);
        } else if (predictedY > canvas.height) {
            const timeToBottomWall = (canvas.height - ballY) / ballSpeedY;
            const remainingTime = timeToReachPaddle - timeToBottomWall;
            const predictedYAfterBounce = canvas.height + ballSpeedY * remainingTime;
            moveRightPaddle(predictedYAfterBounce);
        } else {
            moveRightPaddle(predictedY);
        }
    }

    if (ballX - ballRadius < 0) {
        aiScore++;
        updateScoreDashes();
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        playerScore++;
        updateScoreDashes();
        resetBall();
    }
}

function moveRightPaddle(targetY) {
    const paddleCenter = rightPaddleY + paddleHeight / 2;
    if (paddleCenter < targetY) {
        rightPaddleY += 6; 
    } else if (paddleCenter > targetY) {
        rightPaddleY -= 6; 
    }

    if (rightPaddleY < 0) {
        rightPaddleY = 0;
    } else if (rightPaddleY + paddleHeight > canvas.height) {
        rightPaddleY = canvas.height - paddleHeight;
    }
}


function movePaddles() {
if (gameOver) return;
if (upArrow && leftPaddleY > 0) {
    leftPaddleY -= 10;
} else if (downArrow && leftPaddleY + paddleHeight < canvas.height) {
    leftPaddleY += 10;
}
}

function detectCollisions() {
if (ballX - ballRadius < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
    ballSpeedY += (ballY - (leftPaddleY + paddleHeight / 2)) * 0.09;
}

if (ballX + ballRadius > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddleHeight) {
    ballSpeedX = -ballSpeedX;
    ballSpeedY += (ballY - (rightPaddleY + paddleHeight / 2)) * 0.09;
}
}

function resetBall() {
ballX = canvas.width / 2;
ballY = canvas.height / 2;

if (ballSpeedX > 0) {
    ballSpeedX = 8;
} else {
    ballSpeedX = -8;
}

ballSpeedY = 0;
}

function render() {
context.clearRect(0, 0, canvas.width, canvas.height);

var backgroundImage = new Image();
context.globalAlpha = 0.9;
context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

context.globalAlpha = 15;

context.fillStyle = "#ffffff";

drawRoundedRect(0, leftPaddleY, paddleWidth, paddleHeight, 10);
drawRoundedRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight, 10);

context.beginPath();
context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
context.fillStyle = "#ffffff";
context.fill();

// document.getElementById("player-score").textContent = playerScore;
// document.getElementById("ai-score").textContent = aiScore;

gamePage.shadowRoot.querySelector("#player-score").textContent = playerScore;
gamePage.shadowRoot.querySelector("#ai-score").textContent = aiScore;

if (playerScore >= 4 || aiScore >= 4) {
    gameOver = true;
    gamePage.shadowRoot.querySelector("#home-button-container").style.display = "block"; // Show the Home button
    
    // document.getElementById("home-button-container").style.display = "block"; // Show the Home button
    // sendMatchData(username, "Bot", playerScore, aiScore, winner, "AI game");
    var super_user = gamePage.shadowRoot.querySelector("#username").textContent;
    var super_user2 = "bot"
    
    var playersArray = [super_user, super_user2];

    var winner = playerScore > aiScore ? gamePage.shadowRoot.querySelector("#username").textContent : "AI Bot";
    var loser = playerScore < aiScore ? gamePage.shadowRoot.querySelector("#username").textContent : "AI Bot";
    
    postMatchHistory(winner, loser, `${playerScore}-${aiScore}`, "Bot Game", super_user, playersArray);
    // var winner = playerScore > aiScore ? document.getElementById("username").textContent : "AI Bot";
    showModal(winner);
    // document.dispatchEvent(new Event("gameEnded"));
    // showModal("player1","ai", 4, 1);
    fetchMatchData();
}
}

// gamePage.shadowRoot.querySelector

function showModal(winner) {
// var winnerMessage = document.getElementById('winner-message');
// var winnerScore = document.getElementById('winner-score');

var winnerMessage = gamePage.shadowRoot.querySelector("#winner-message");
var winnerScore = gamePage.shadowRoot.querySelector("#winner-score");

winnerMessage.textContent = `Congratulations!\n`;
winnerScore.textContent = `The Winner is : ${winner}`;

gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'flex';
}

function closeModal() {
gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'none';
}

document.addEventListener("keydown", (event) => {
if (event.key === "ArrowUp") upArrow = true;
if (event.key === "ArrowDown") downArrow = true;
});
document.addEventListener("keyup", (event) => {
if (event.key === "ArrowUp") upArrow = false;
if (event.key === "ArrowDown") downArrow = false;
});
