
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



var startGameButton = gamePage.shadowRoot.querySelector(".start-game-button");
var gameContainer = gamePage.shadowRoot.querySelector("#game-cont");
var player1NameInput = gamePage.shadowRoot.querySelector("#player1-name");
var player2NameInput = gamePage.shadowRoot.querySelector("#player2-name");
var player1NameDisplay = gamePage.shadowRoot.querySelector("#player1-name-display");
var player2NameDisplay = gamePage.shadowRoot.querySelector("#player2-name-display");


var player1Name = "Player1";
var player2Name = "Guest";

function startCountdown(callback) {
    var countdownOverlay = gamePage.shadowRoot.querySelector("#countdown-overlay");
    var countdownText = gamePage.shadowRoot.querySelector("#countdown-text");

    var countdownMessages = ["Ready", "Set", "Go!"];
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
    })
    .catch(error => console.error("Error posting match history:", error));
}

function formatPlayerName(name) {
    if (name.length < 10) {
        return name + ' '.repeat(10 - name.length);
    } else if (name.length > 10) {
        return name.substring(0, 10) + '.';
    }
    return name;
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

setTimeout(() => {
    var gamepage = document.querySelector("game-page");

    if (gamepage && gamepage.shadowRoot) {
        var shadowRoot = gamepage.shadowRoot;
        var nameInputContainer = shadowRoot.querySelector(".name-input-container");
        var startGameButton = shadowRoot.querySelector("#start-game-button");
        var gameContainer = shadowRoot.querySelector("#game-cont");

        if (startGameButton && nameInputContainer) {
            startGameButton.addEventListener("click", function () {
                nameInputContainer.style.display = "none";
                gameContainer.style.display = "block";
            });
        } else {
            console.error("Start Game button or Name Input Container not found!");
        }
    } else {
        console.error("Game Page or ShadowRoot not available!");
    }
}, 500);




startGameButton.addEventListener("click", () => {
    player1Name = player1NameInput.value.trim() || "Player1";
    player2Name = player2NameInput.value.trim() || "Guest";

    player1Name = formatPlayerName(player1Name);
    player2Name = formatPlayerName(player2Name);

    player1NameDisplay.textContent = player1Name;
    player2NameDisplay.textContent = player2Name;

    document.addEventListener("DOMContentLoaded", function () {
        var shadowRoot = gamePage.shadowRoot;
        var nameInputContainer = shadowRoot.querySelector(".name-input-container");
    
        if (nameInput) {
            nameInput.style.display = "none";
        } else {
            console.error("Element .name-input-container not found!");
        }
    });
    

    gameContainer.style.display = "flex";

    startCountdown(() => {
        gameLoop();
    });
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
var ballSpeedY = 0.5;

var upArrow = false, downArrow = false; 
var wKey = false, sKey = false;        

var player1Score = 0;
var player2Score = 0;

var gameOver = false;



function gameLoop() {
    if (!gameOver) {
        moveBall();
        movePaddles();
        detectCollisions();
        render();
        requestAnimationFrame(gameLoop); 
    }
}

function updateScoreDashes() {
    var playerDashes = gamePage.shadowRoot.querySelector("#player-dashes").children;
    var aiDashes = gamePage.shadowRoot.querySelector("#ai-dashes").children;
    
    Array.from(playerDashes).forEach(dash => dash.classList.remove('active'));
    Array.from(aiDashes).forEach(dash => dash.classList.remove('active'));

    for (var i = 2; i < player1Score + 2; i++) {
        if (playerDashes[i] && playerDashes[i].classList.contains('dash')) {
            playerDashes[i].classList.add('active');
        }
    }
    for (var i = 0; i < player2Score; i++) {
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

    if (ballX - ballRadius < 0) {
        player2Score++; 
        updateScoreDashes();
        resetBall();
    }
    if (ballX + ballRadius > canvas.width) {
        player1Score++;
        updateScoreDashes();
        resetBall();
    }
}

function movePaddles() {
    if (gameOver) return;

    if (wKey && leftPaddleY + paddleHeight < canvas.height) {
        leftPaddleY += 10;  
    } else if (sKey && leftPaddleY > 0) {
        leftPaddleY -= 10;  
    }

    if (upArrow && rightPaddleY > 0) {
        rightPaddleY -= 10;  
    } else if (downArrow && rightPaddleY + paddleHeight < canvas.height) {
        rightPaddleY += 10;  
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
    ballSpeedX = ballSpeedX > 0 ? -8 : 8;  
    ballSpeedY = 0.5; 
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);  

    context.fillStyle = "#f1f1f1";
    drawRoundedRect(0, leftPaddleY, paddleWidth, paddleHeight, 10); 
    drawRoundedRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight, 10); 

    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#f1f1f1";
    context.fill();

    gamePage.shadowRoot.querySelector("#player1-score").textContent = player1Score;
    gamePage.shadowRoot.querySelector("#player2-score").textContent = player2Score;

    if (player2Score >= 4 || player1Score >= 4) {
        gameOver = true; 
        gamePage.shadowRoot.querySelector("#home-button-container").style.display = "block"; 

        var super_user = player1Name;
        var playersArray = [player1Name, player2Name];
        var loser = player1Score < player2Score ? player1Name : player2Name;
        var winner = player1Score > player2Score ? player1Name : player2Name;
        postMatchHistory(winner, loser, `${player1Score}-${player2Score}`, "Local Game", super_user, playersArray);
        showModal(winner);
        fetchMatchData();
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

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") upArrow = true;
    if (event.key === "ArrowDown") downArrow = true;
    if (event.key === "w" || event.key === "W") wKey = true;
    if (event.key === "s" || event.key === "S") sKey = true;
});
document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowUp") upArrow = false;
    if (event.key === "ArrowDown") downArrow = false;
    if (event.key === "w" || event.key === "W") wKey = false;
    if (event.key === "s" || event.key === "S") sKey = false;
});

