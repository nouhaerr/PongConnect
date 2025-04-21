    var gamePage = document.querySelector("game-page");
    if (!gamePage || !document) {
        console.error("GamePage not found!");
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
        
                var usernameElement = gamePage.shadowRoot.querySelector("#player1-name-display");
                var avatarElement = gamePage.shadowRoot.querySelector(".user1_img");
        
                if (usernameElement) {
                    usernameElement.textContent = data.username;
                }
        
                if (avatarElement) {
                    avatarElement.src = data.avatar || "/assets/default-avatar.png"; // Use default avatar if missing
                }
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
                players: playersArray.map(player => player.trim()) 
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
        
        
    

    var startGameButton = gamePage.shadowRoot.querySelector("#start-game-button");
    var gameContainer = gamePage.shadowRoot.querySelector("#game-cont");
    var player1NameInput = gamePage.shadowRoot.querySelector(".player1-name");
    var player2NameInput = gamePage.shadowRoot.querySelector(".player2-name");
    var player1NameDisplay = gamePage.shadowRoot.querySelector("#player1-name-display");
    var player2NameDisplay = gamePage.shadowRoot.querySelector("#player2-name-display");
    var board = gamePage.shadowRoot.querySelector(".tic-tac-toe-board");
    var homeButtonContainer = gamePage.shadowRoot.querySelector("#home-button-container");  // Add this in your HTML


    var player2Name = "Guest";
    var player1Score = 0, player2Score = 0;
    var currentPlayer;
    var gameBoard;
    var gameOver = false;


    setTimeout(() => {
        var gamepage = document.querySelector("game-page");
    
        if (gamepage && gamepage.shadowRoot) {
            var shadowRoot = gamepage.shadowRoot;
            var nameInputContainer = shadowRoot.querySelector(".name-input-container");
            var startGameButton = shadowRoot.querySelector(".start-game-button");
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
    }, 1000);


startGameButton.addEventListener("click", () => {
    player1Name = formatPlayerName(player1NameInput.value.trim());
    if (player1Name && player1NameInput.value.trim().length > 0)
    {
        player1Name = formatPlayerName(player1NameInput.value.trim());
        player1NameDisplay.textContent = player1Name;
    }
    player2Name = formatPlayerName(player2NameInput.value.trim() || "Player 2");
    player2NameDisplay.textContent = player2Name;
    gamePage.shadowRoot.querySelector(".name-input-container").style.display = "none";
    gameContainer.style.display = "flex";
    resetBoard();
});

fetchUserData();

    function resetBoard() {
        gameBoard = Array(9).fill(null);
        board.innerHTML = "";
        for (var i = 0; i < 9; i++) {
            var cell = document.createElement("div");
            cell.dataset.index = i;
            cell.addEventListener("click", handleMove);
            board.appendChild(cell);
        }
        currentPlayer = "X";
    }

    
    function updateScoreDashes() {
        var playerDashes = gamePage.shadowRoot.querySelector('#player-dashes').children;
        var aiDashes = gamePage.shadowRoot.querySelector('#ai-dashes').children;
        
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

    function handleMove(event) {
        if (gameOver) return;

        var index = event.target.dataset.index;

        if (!gameBoard[index]) {
            gameBoard[index] = currentPlayer;
            event.target.textContent = currentPlayer;
            event.target.classList.add("taken");

            var winningPattern = checkWin(currentPlayer);
            if (winningPattern) {
                highlightWinningLine(winningPattern);
                setTimeout(() => {
                    currentPlayer === "X" ? player1Score++ : player2Score++;
                    updateScores();
                    updateScoreDashes();

                    if (player1Score >= 4 || player2Score >= 4) { 
                        endGame();
                    } else {
                        resetBoard();
                    }
                }, 1000);
            } else if (gameBoard.every(cell => cell)) {
                alert("It's a draw!");
                resetBoard();
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
            }
        }
    }

    function highlightWinningLine(pattern) {
        pattern.forEach(index => {
            var cell = board.children[index];
            currentPlayer === "X" ? cell.style.backgroundColor = "rgba(254, 21, 169, 0.96)" : cell.style.backgroundColor = "#0ed8df";;
        });
    }

    function checkWin(player) {
        var winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.find(pattern =>
            pattern.every(index => gameBoard[index] === player)
        );
    }

    function updateScores() {
        gamePage.shadowRoot.querySelector("#player1-score").textContent = player1Score;
        gamePage.shadowRoot.querySelector("#player2-score").textContent = player2Score;
    }
    
    function showModal(winner) {
        var winnerMessage = gamePage.shadowRoot.querySelector("#winner-message");
        var winnerScore = gamePage.shadowRoot.querySelector("#winner-score");
        
        winnerMessage.textContent = `Congratulations!\n`;
        winnerScore.textContent = `The Winner is : ${winner}`;
        
        gamePage.shadowRoot.querySelector('#congratulations-modal').style.display = 'flex';
    }

    var closeModalButton = gamePage.shadowRoot.querySelector("#congratulations-modal");

    if (closeModalButton) {
        closeModalButton.addEventListener("click", closeModal);
    }
    
    function closeModal() {
        gamePage.shadowRoot.querySelector("#congratulations-modal").style.display = 'none';
    }

    function endGame() {
        gameOver = true;
        var super_user = player1NameDisplay.textContent;
        var super_user2 = player2NameDisplay.textContent;
        var playersArray = [super_user, super_user2];
        
        var winner = player1Score > player2Score ? player1NameDisplay.textContent : player2NameDisplay.textContent;
        var loser = player1Score < player2Score ? player1NameDisplay.textContent : player2NameDisplay.textContent;
        
        postMatchHistory(winner, loser, `${player1Score}-${player2Score}`, "XO Game", super_user, playersArray);

        showModal(winner);
        homeButtonContainer.style.display = "block";
    }

    function formatPlayerName(name) {
        if (name.length < 8) {
            return name + ' '.repeat(8 - name.length);
        } else if (name.length > 8) {
            return name.substring(0, 8) + '.';
        }
        return name;
    }
