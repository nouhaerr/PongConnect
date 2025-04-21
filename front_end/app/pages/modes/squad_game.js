var gamePage = document.querySelector("game-page");
if (!gamePage) {
    console.error("GamePage not found!");
} else if (!gamePage.shadowRoot) {
    console.error("ShadowRoot not found!");
}


    var canvas = gamePage.shadowRoot.querySelector("#pong");
    if (!canvas) {
        console.error("Canvas not found!");
        // return;
    }

    var context = canvas.getContext("2d");

var player1NameInput = gamePage.shadowRoot.querySelector("#player1-name");
var player2NameInput = gamePage.shadowRoot.querySelector("#player2-name");
var player3NameInput = gamePage.shadowRoot.querySelector("#player3-name");
var player4NameInput = gamePage.shadowRoot.querySelector("#player4-name");
var player1NameDisplay = gamePage.shadowRoot.querySelector("#player1-name-display");
var player2NameDisplay = gamePage.shadowRoot.querySelector("#player2-name-display");
var player3NameDisplay = gamePage.shadowRoot.querySelector("#player3-name-display");
var player4NameDisplay = gamePage.shadowRoot.querySelector("#player4-name-display");

var paddleWidth = 10, paddleHeight = 60, ballRadius = 10;
var halfCanvasHeight = canvas.height / 2;

var upperLeftPaddleY = 0; 
var lowerLeftPaddleY = halfCanvasHeight;

var upperRightPaddleY = 0; 
var lowerRightPaddleY = halfCanvasHeight; 

var ballX = canvas.width / 2;
var ballY = canvas.height / 2;
var ballSpeedX = 6;
var ballSpeedY = 0.5;

var team1Score = 0;
var team2Score = 0;

var controls = {
    w: false, s: false,
    v: false, b: false, 
    i: false, k: false, 
    ArrowUp: false, ArrowDown: false,
};

var gameOver = false;


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
    })
    .catch(error => console.error("Error posting match history:", error));
}


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

function startCountdown(callback) {
    var countdownOverlay = gamePage.shadowRoot.querySelector("#countdown-overlay");
    var countdownText = gamePage.shadowRoot.querySelector("#countdown-text");

    var countdownMessages = ["Ready", "Set", "GOO!"];
    var index = 0;

    function nextMessage() {
        if (index < countdownMessages.length) {
            countdownText.textContent = countdownMessages[index];
            index++;
            setTimeout(nextMessage, 1500); // Delay next message
        } else {
            countdownOverlay.style.display = "none"; // Hide overlay
            callback(); // Start game
        }
    }

    countdownOverlay.style.display = "flex";

    // Start the countdown with a delay to prevent immediate repetition
    setTimeout(nextMessage, 1000);
}

function formatPlayerName(name) {
    if (name.length < 7) {
        return name + ' '.repeat(7 - name.length);
    } else if (name.length > 7) {
        return name.substring(0, 7) + '.';
    }
    return name;
}

document.addEventListener("keydown", event => {
    if (event.key in controls) controls[event.key] = true;
});
document.addEventListener("keyup", event => {
    if (event.key in controls) controls[event.key] = false;
});

var startGameButton = gamePage.shadowRoot.querySelector(".start-game-button");
var gameContainer = gamePage.shadowRoot.querySelector("#game-cont");
var nameInputContainer = gamePage.shadowRoot.querySelector(".name-input-container");

startGameButton.addEventListener("click", () => {

    var player1Name = player1NameInput.value.trim() || "Player1";
    var player2Name = player2NameInput.value.trim() || "Player2";
    var player3Name = player3NameInput.value.trim() || "Player3";
    var player4Name = player4NameInput.value.trim() || "Player4";


    player1Name = formatPlayerName(player1Name);
    player2Name = formatPlayerName(player2Name);
    player3Name = formatPlayerName(player3Name);
    player4Name = formatPlayerName(player4Name);

    player1NameDisplay.textContent = player1Name;
    player2NameDisplay.textContent = player2Name;
    player3NameDisplay.textContent = player3Name;
    player4NameDisplay.textContent = player4Name;


    gamePage.shadowRoot.querySelector(".name-input-container").style.display = "none";
    gameContainer.style.display = "flex";
});


function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = ballSpeedX > 0 ? -6 : 6;
    ballSpeedY = 1;
}

function movePaddles() {
    if (controls.w && upperLeftPaddleY > 0) upperLeftPaddleY -= 5;
    if (controls.s && upperLeftPaddleY + paddleHeight < halfCanvasHeight) upperLeftPaddleY += 5;

    if (controls.v && lowerLeftPaddleY > halfCanvasHeight) lowerLeftPaddleY -= 5;
    if (controls.b && lowerLeftPaddleY + paddleHeight < canvas.height) lowerLeftPaddleY += 5;

    if (controls.i && upperRightPaddleY > 0) upperRightPaddleY -= 5;
    if (controls.k && upperRightPaddleY + paddleHeight < halfCanvasHeight) upperRightPaddleY += 5;

    if (controls.ArrowUp && lowerRightPaddleY > halfCanvasHeight) lowerRightPaddleY -= 5;
    if (controls.ArrowDown && lowerRightPaddleY + paddleHeight < canvas.height) lowerRightPaddleY += 5;
}

function moveBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 9)
        ballY += 2;
    if (ballY >= 392)
        ballY -= 2;

    if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    if (ballX - ballRadius < 0) {
        team2Score++;
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        team1Score++;
        resetBall();
    }

    detectCollisions();
}

function detectCollisions() {
    if (
        ballX - ballRadius < paddleWidth &&
        (
            (ballY > upperLeftPaddleY && ballY < upperLeftPaddleY + paddleHeight) ||
            (ballY > lowerLeftPaddleY && ballY < lowerLeftPaddleY + paddleHeight)
        )
    ) {
        ballSpeedX = -ballSpeedX;
        ballSpeedY += (ballY - (ballY > lowerLeftPaddleY ? lowerLeftPaddleY : upperLeftPaddleY)) * 0.06;
    }

    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        (
            (ballY > upperRightPaddleY && ballY < upperRightPaddleY + paddleHeight) ||
            (ballY > lowerRightPaddleY && ballY < lowerRightPaddleY + paddleHeight)
        )
    ) {
        ballSpeedX = -ballSpeedX;
        ballSpeedY += (ballY - (ballY > lowerRightPaddleY ? lowerRightPaddleY : upperRightPaddleY)) * 0.06;
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#f1f1f1"; 
    drawRoundedRect(0, upperLeftPaddleY, paddleWidth, paddleHeight, 6); 
    drawRoundedRect(0, lowerLeftPaddleY, paddleWidth, paddleHeight, 6); 

    drawRoundedRect(canvas.width - paddleWidth, upperRightPaddleY, paddleWidth, paddleHeight, 6);
    drawRoundedRect(canvas.width - paddleWidth, lowerRightPaddleY, paddleWidth, paddleHeight, 6);

    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#f1f1f1";
    context.fill();

    context.fillStyle = "#FFFFFF";
    context.font = "20px Arial";
    gamePage.shadowRoot.querySelector("#team1-score").textContent = team1Score;
    gamePage.shadowRoot.querySelector("#team2-score").textContent = team2Score;

    if (team2Score >= 4 || team1Score >= 4)
    {
        if (team2Score >= 4)
        {
            gameOver = true;
            showModal("Team 2")
            gamePage.shadowRoot.querySelector("#home-button-container").style.display = "block";
            postMatchHistory();
        }
        else
        {
            gameOver = true;
            showModal("Team 1")
            gamePage.shadowRoot.querySelector("#home-button-container").style.display = "block";
        }
    }
}

function showModal(winner) {
    var winnerMessage = gamePage.shadowRoot.querySelector("#winner-message");
    var winnerScore = gamePage.shadowRoot.querySelector("#winner-score");
    
    winnerMessage.textContent = `Congratulations!\n`;
    winnerScore.textContent = `The Winner is : ${winner}`;

    gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'flex';
}

function closeModal() {
    gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'none';
}

function gameLoop() {
    if (!gameOver) {
        movePaddles();
        moveBall();
        render();
        requestAnimationFrame(gameLoop);
    }
}

startCountdown(() => {
    gameLoop();
});