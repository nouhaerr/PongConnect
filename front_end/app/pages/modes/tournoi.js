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

var startTournamentButton = gamePage.shadowRoot.querySelector(".start-tournament-button");
var startMatchButton = gamePage.shadowRoot.querySelector(".start-match-button");
var endMatchButton = gamePage.shadowRoot.querySelector(".end-match-button");
var nameInputContainer = gamePage.shadowRoot.querySelector(".name-input-container");
var gameContainer = gamePage.shadowRoot.querySelector("#game-cont");
var tournamentBracket = gamePage.shadowRoot.querySelector(".tournament-bracket");


var matches = [
    gamePage.shadowRoot.querySelector("#match1"),
    gamePage.shadowRoot.querySelector("#match2"),
    gamePage.shadowRoot.querySelector("#final-match")
];

var playerInputs = [
    gamePage.shadowRoot.querySelector(".player1-name"),
    gamePage.shadowRoot.querySelector(".player2-name"),
    gamePage.shadowRoot.querySelector(".player3-name"),
    gamePage.shadowRoot.querySelector(".player4-name"),
];

var playerDisplay = [
    gamePage.shadowRoot.querySelector("#player1-name-display"),
    gamePage.shadowRoot.querySelector("#player2-name-display"),
];

var playerVsDisplay = [
    gamePage.shadowRoot.querySelector("#player1-vs"),
    gamePage.shadowRoot.querySelector("#player2-vs")
];


var players = [];
var matchQueue = [];
var currentMatch = [];
var winners = []; 
var player1Score = 0;
var player2Score = 0;
var gameOver = false;


var paddleWidth = 10,
    paddleHeight = 100;
var leftPaddleY = (canvas.height - paddleHeight) / 2;
var rightPaddleY = (canvas.height - paddleHeight) / 2;

var ballRadius = 10;
var ballX = canvas.width / 2;
var ballY = canvas.height / 2;
var ballSpeedX = 8;
var ballSpeedY = 0.5;

var upArrow = false,
    downArrow = false,
    wKey = false,
    sKey = false;

var currentMatchIndex = 0;


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

function formatPlayerName(name) {
    if (name.length < 7) {
        return name + ' '.repeat(7 - name.length);
    } else if (name.length > 7) {
        return name.substring(0, 7) + '.';
    }
    return name;
}

function highlightMatch(index) {
    matches.forEach(match => match.classList.remove('active'));
    matches[index].classList.add('active');
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
    var gamePage = document.querySelector("game-page");

    if (gamePage && gamePage.shadowRoot) {
        var shadowRoot = gamePage.shadowRoot;
        var nameInputContainer = shadowRoot.querySelector(".name-input-container");
        var startGameButton = shadowRoot.querySelector(".start-tournament-button");
        var gameContainer = shadowRoot.querySelector("#game-cont");

        if (startGameButton && nameInputContainer) {
            startGameButton.addEventListener("click", function () {
                nameInputContainer.style.display = "none"; // Hide name input
                gameContainer.style.display = "none"; // Show game container
            });
        } else {
            console.error("Start Game button or Name Input Container not found!");
        }
    } else {
        console.error("Game Page or ShadowRoot not available!");
    }
}, 500);



// document.addEventListener("DOMContentLoaded", () => {
    // var startTournamentButton = gamePage.shadowRoot.querySelector("#start-tournament-button");
    if (!startTournamentButton) {
        console.error("❌ startTournamentButton not found!");
        // return;
    }


    startTournamentButton.addEventListener("click", () => {

        var tournamentBracket = gamePage.shadowRoot.querySelector(".tournament-bracket");

        tournamentBracket.style.display = "flex";

        players = playerInputs.map(input => formatPlayerName(input.value.trim() || "Player"));

        matchQueue = [
            [players[0], players[1]],
            [players[2], players[3]],
        ];

        gamePage.shadowRoot.querySelectorAll('.player').forEach((playerSpan, index) => {
            playerSpan.textContent = players[index] || `Player ${index + 1}`;
        });

        nameInputContainer.style.display = "none";
        tournamentBracket.style.display = "flex";

        highlightMatch(currentMatchIndex);

        startMatchButton.style.display = "block";
    });


function showMatchPairings() {

    var playerVsDisplay = [
        document.getElementById("player1-name-display"),
        document.getElementById("player2-name-display"),
    ];

    if (!playerVsDisplay[0] || !playerVsDisplay[1]) {
        return;
    }

    if (matchQueue.length > 0) {
        currentMatch = matchQueue.shift();
    } else if (winners.length === 2) {
        // Use the winners for the final match
        currentMatch = [winners[0], winners[1]];
        winners = []; // Reset winners array after the final match is set
    } else {
        alert("Tournament compvare! Reloading...");
        window.location.reload();
        return;
    }

    playerVsDisplay[0].textContent = currentMatch[0];
    playerVsDisplay[1].textContent = currentMatch[1];
}

startMatchButton.addEventListener("click", () => {
    tournamentBracket.style.display = "none";
    gameContainer.style.display = "flex";

    endMatchButton.style.display = "none";

    currentMatch = matchQueue.shift();
    playerDisplay[0].textContent = currentMatch[0];
    playerDisplay[1].textContent = currentMatch[1];
    showMatchPairings();
    resetGame();
    gameLoop();
});



endMatchButton.addEventListener('click', () => {
    gameContainer.style.display = "none";
    tournamentBracket.style.display = "flex";

    var winner = player1Score > player2Score ? currentMatch[0] : currentMatch[1];
    winners.push(winner);

    endMatchButton.style.display = "none";

    if (winners.length === 1) {
        gamePage.shadowRoot.querySelector(".winner1").textContent = winners[0]; // First finalist
    } else if (winners.length === 2) {
        gamePage.shadowRoot.querySelector(".winner2").textContent = winners[1]; // Second finalist
    }

    if (currentMatchIndex < matches.length - 2) {
        currentMatchIndex++;
        highlightMatch(currentMatchIndex);
        startMatchButton.style.display = "block";
        showMatchPairings();
    } else if (winners.length === 2) {
        matchQueue.push(winners);
        highlightMatch(currentMatchIndex + 1);
        startMatchButton.style.display = "block";
        showMatchPairings();
    } else {
        alert("Tournament compvare!");
        var homeButtonContainer = gamePage.shadowRoot.querySelector("#home-button-container");
        if (homeButtonContainer) {
            homeButtonContainer.style.display = "block";
        } else {
            console.error("Home button container not found in the document.");
        }    
    }
});



function resetGame() {
    player1Score = 0;
    player2Score = 0;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    leftPaddleY = (canvas.height - paddleHeight) / 2;
    rightPaddleY = (canvas.height - paddleHeight) / 2;
    gameOver = false;

    gamePage.shadowRoot.querySelector("#player1-score").textContent = player1Score;
    gamePage.shadowRoot.querySelector("#player2-score").textContent = player2Score;
}

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

    // for (var i = 0; i < player1Score; i++) {
    //     playerDashes[i].classList.add('active');
    // }
    for (var i = 2; i < player1Score + 2; i++) {
        if (playerDashes[i] && playerDashes[i].classList.contains('dash')) {
            playerDashes[i].classList.add('active');
        }
    }
    for (var i = 0; i < player2Score; i++) {
        aiDashes[i].classList.add('active');
    }
}

function showModal(winner) {
    var winnerMessage = gamePage.shadowRoot.querySelector("#winner-message");
    var winnerScore = gamePage.shadowRoot.querySelector("#winner-score");
    
    winnerMessage.textContent = `Congratulations!\n`;
    winnerScore.textContent = `The Winner is : ${winner}`;
    // winnerMessage.textContent = `${winner} Wins!`;
    // winnerScore.textContent = `Final Score:${winner} ${wscore} - ${lscore} ${loser}`;

    gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'flex';
}

function closeModal() {
    gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'none';
}

function moveBall() {
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

    if (player1Score >= 4 || player2Score >= 4) {
        gameOver = true;
        // endMatchButton.style.display = "block";
        if (winners.length === 2 && matchQueue.length === 0) {
            var matchWinner = player1Score >= 4 ? currentMatch[0] : currentMatch[1];
            var matchLoser = player1Score < 4 ? currentMatch[0] : currentMatch[1];
            var playersArray = [matchWinner, matchLoser];
                    
            postMatchHistory(matchWinner, matchLoser, `${player1Score}-${player2Score}`, "tournament Game", "final", playersArray);
            
            // var tournamentWinner = winners[1];
            // var winnerScore = player1Score > player2Score ? player1Score : player2Score;
            // alert(`Congratulations to ${tournamentWinner} for winning the tournament with a score of ${winnerScore}!`);
            // var winner = player1Score > player2Score ? player1NameDisplay.textContent : player2NameDisplay.textContent;
    

            showModal(matchWinner);
            gamePage.shadowRoot.querySelector("#home-button-container").style.display = "block";

            // alert("Tournament compvare!");
            endMatchButton.style.display = "none";

        } else {
            var matchWinner = player1Score >= 4 ? currentMatch[0] : currentMatch[1];
            var matchLoser = player1Score < 4 ? currentMatch[0] : currentMatch[1];
            var playersArray = [matchWinner, matchLoser];

            postMatchHistory(matchWinner, matchLoser, `${player1Score}-${player2Score}`, "tournament Game", "semifinal", playersArray);

            endMatchButton.style.display = "block";
        }
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = ballSpeedX > 0 ? -8 : 8;
    ballSpeedY = 0.5;
}

function movePaddles() {
    if (wKey && leftPaddleY + paddleHeight < canvas.height) {
        leftPaddleY += 10;
    }
    if (sKey && leftPaddleY > 0) {
        leftPaddleY -= 10;
    }
    if (upArrow && rightPaddleY > 0) {
        rightPaddleY -= 10;
    }
    if (downArrow && rightPaddleY + paddleHeight < canvas.height) {
        rightPaddleY += 10;
    }
}

function detectCollisions() {
    if (
        ballX - ballRadius < paddleWidth &&
        ballY > leftPaddleY &&
        ballY < leftPaddleY + paddleHeight
    ) { 
        ballSpeedX = -ballSpeedX;
        ballSpeedY += (ballY - (leftPaddleY + paddleHeight / 2)) * 0.08;
    }

    if (
        ballX + ballRadius > canvas.width - paddleWidth &&
        ballY > rightPaddleY &&
        ballY < rightPaddleY + paddleHeight
    ) {
        ballSpeedX = -ballSpeedX;
        ballSpeedY += (ballY - (rightPaddleY + paddleHeight / 2)) * 0.08;
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // context.fillStyle = "#f0f0f0";
    // context.fillRect(0, leftPaddleY, paddleWidth, paddleHeight);
    // context.fillRect(
    //     canvas.width - paddleWidth,
    //     rightPaddleY,
    //     paddleWidth,
    //     paddleHeight
    // );
    context.fillStyle = "#f1f1f1";
    drawRoundedRect(0, leftPaddleY, paddleWidth, paddleHeight, 10); // Player 1
    drawRoundedRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight, 10); // Player 2

    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#f0f0f0";
    context.fill();

    gamePage.shadowRoot.querySelector("#player1-score").textContent = player1Score;
    gamePage.shadowRoot.querySelector("#player2-score").textContent = player2Score;
}

document.addEventListener("keydown", event => {
    if (event.key === "w" || event.key === "W") wKey = true;
    if (event.key === "s" || event.key === "S") sKey = true;
    if (event.key === "ArrowUp") upArrow = true;
    if (event.key === "ArrowDown") downArrow = true;
});

document.addEventListener("keyup", event => {
    if (event.key === "w" || event.key === "W") wKey = false;
    if (event.key === "s" || event.key === "S") sKey = false;
    if (event.key === "ArrowUp") upArrow = false;
    if (event.key === "ArrowDown") downArrow = false;
});