let gameModeScriptsLoaded = {};

class GamePage extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: "open" });
    
            const container = document.createElement("div");
            container.classList.add("card-container");
    
            container.innerHTML = `
                <section id="game-page" class="page">
                    <div class="cards-wrapper">
                        ${this.createGameCard("bot", "AI Game", "../imgs_game/ai-assistant.png", "Train with AI opponents")}
                        ${this.createGameCard("local_game", "Local Game", "../imgs_game/ping-pong.png", "Play with a friend offline")}
                        ${this.createGameCard("squad_game", "Squad Game", "../imgs_game/squad.png", "Team up and compete")}
                        ${this.createGameCard("tournoi", "Tournament", "../imgs_game/championship.png", "Compete in a tournament")}
                        ${this.createGameCard("xo_game", "XO Game", "../imgs_game/tic-tac-toe.png", "Tic Tac Toe battle")}
                    </div>
                </section>
                <div id="game-mode-container"></div>
            `;
    
            const style = document.createElement("style");
            style.textContent = `
                .card-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                    padding: 20px;
                }
    
                .section-title {
                    font-size: 28px;
                    font-weight: bold;
                    color: #D4AF37;
                    text-align: center;
                    margin-bottom: 20px;
                    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
                }
    
                .cards-wrapper {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    flex-wrap: wrap;
                    width: 100%;
                }
    
                .card {
                    width: 220px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 15px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s;
                    text-align: center;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                }
    
                .card:hover {
                    transform: scale(1.05);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
                }
    
                .card img {
                    width: 80px;
                    height: auto;
                    margin-bottom: 10px;
                    object-fit: contain;
                }
    
                .card h2 {
                    font-size: 18px;
                    font-weight: bold;
                    color: #D4AF37;
                    margin-bottom: 8px;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
                }
    
                .card p {
                    font-size: 13px;
                    color: #D3D3D3;
                    margin-bottom: 12px;
                    padding: 0 10px;
                }
    
                .card button {
                    background: #D4AF37;
                    color: #000;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.3s ease, background-color 0.3s ease;
                }
    
                .card button:hover {
                    background: #E6BE8A;
                    transform: scale(1.1);
                }
    
                .card.fade-out {
                    opacity: 0;
                    transform: scale(0.95);
                }
    
                @media (max-width: 768px) {
                    .cards-wrapper {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
    
                    .card {
                        width: 180px;
                    }
    
                    .section-title {
                        font-size: 24px;
                    }
                }
            `;
    
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(container);
    
            this.addEventListeners();
        }
    
        createGameCard(mode, title, img, description) {
            return `
                <div class="card" data-mode="${mode}">
                    <img src="${img}" alt="${title} Icon">
                    <h2>${title}</h2>
                    <p>${description}</p>
                    <button class="start-button">Play Now</button>
                </div>
            `;
        }
    

    addEventListeners() {
        const cards = this.shadowRoot.querySelectorAll(".card");
        cards.forEach((card) => {
            card.addEventListener("click", (event) => this.handleGameCardClick(event));
        });
    }

    handleGameCardClick(event) {
        const card = event.target.closest(".card");
        const mode = card.dataset.mode;
        this.loadGameMode(mode);

        const gameCards = this.shadowRoot.querySelectorAll(".card");
        gameCards.forEach((card) => {
            card.style.opacity = "0";
            setTimeout(() => (card.style.display = "none"), 300);
        });
    }
    

    connectedCallback() {
        const backToHomeButton = this.shadowRoot.querySelector('#home-button');
        if (backToHomeButton) {
            backToHomeButton.addEventListener('click', () => {
                const gameCards = this.shadowRoot.querySelectorAll('.card');
                gameCards.forEach(card => {
                    card.style.display = 'block'; 
                    card.style.opacity = '1';     
                    card.style.visibility = 'visible';
                });
    
                const gameModeContainer = this.shadowRoot.querySelector("#game-mode-container");
                if (gameModeContainer) {
                    gameModeContainer.innerHTML = ''; 
                }
            });
        }
    
        document.addEventListener("gameEnded", () => {
            const gameCards = this.shadowRoot.querySelectorAll('.card');
            gameCards.forEach(card => {
                card.style.display = 'block';      
                card.style.opacity = '1';          
                card.style.visibility = 'visible'; 
            });
    
            const gameModeContainer = this.shadowRoot.querySelector("#game-mode-container");
            if (gameModeContainer) {
                gameModeContainer.innerHTML = '';
            }
        });
    }
       

    loadGameMode(mode) {
        const gameModeContainer = this.shadowRoot.querySelector('#game-mode-container');

        gameModeContainer.innerHTML = '';
        
        gameModeContainer.style.display = "flex";
        gameModeContainer.style.justifyContent = "center";
        gameModeContainer.style.alignItems = "center";
        gameModeContainer.style.width = "92%";
        gameModeContainer.style.height = "92vh";
        
        switch (mode) {
            case 'bot':
                this.loadGameModeContent('bot', gameModeContainer);
                break;
            case 'local_game':
                this.loadGameModeContent('local_game', gameModeContainer);
                break;
            case 'squad_game':
                this.loadGameModeContent('squad_game', gameModeContainer);
                break;
            case 'tournoi':
                this.loadGameModeContent('tournoi', gameModeContainer);
                break;
            case 'xo_game':
                this.loadGameModeContent('xo_game', gameModeContainer);
                break;
            default:
                console.error('Unknown game mode!');
        }
    }

    loadGameModeContent(mode, container) {

        let htmlContent = '';
        
        switch (mode) {
            case 'bot':
                htmlContent = `
                    <div class="bot_gaming">
                        <div id="countdown-overlay">
                            <div id="countdown-text">Ready</div>
                        </div>
                        <div class="user_info">
                            <div class="user1_info">
                                <div class="score-dashes" id="player-dashes">
                                    <!-- <img src="guestt.png" class="user1_img" id="user1_img"><p class="username" id="username">Player</p> -->
                                    <img src="../imgs_game/img/guestt.png" class="user1_img" id="user1_img"><p class="username" id="username">Player</p>
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span>
                                </div>
                            </div>
                            <div class="user2_info">
                                <div class="score-dashes" id="ai-dashes">
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><p class="username2">Robot</p>
                                    <img src="../imgs_game/img/robott.png" class="user2_img">
                                    <!-- <img src="robott.png" class="user2_img"> -->
                                </div>
                            </div>            
                        </div>
                        <div class="score-container">
                            <div class="score-board">
                                <span id="player-score">0</span> - <span id="ai-score">0</span>
                            </div>
                        </div>
                        <div class="game-container">
                            <canvas id="pong" width="800" height="400"></canvas>
                        </div>
                        <div id="home-button-container" style="display: none;">
                            <a class="button" id="home-button">Back to Home</a>
                        </div>
                        <div id="congratulations-modal" style="display: none;">
                            <div class="modal-content">
                                <p id="winner-message"></p>
                                <p id="winner-score"></p>
                                <button onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'local_game':
                htmlContent = `
                    <div class="name-input-container">
                        <!-- <label for="player1-name">Player 1 Name:</label> -->
                        <input class="player1-name" type="text" id="player1-name" placeholder="                   Enter Player 1 Name">
                        <!-- <label for="player2-name">Player 2 Name:</label> -->
                        <input type="text" id="player2-name" class="player2-name" placeholder="                   Enter Player 2 Name">
                        <button class="start-game-button" id="start-game-button">Start Game</button>
                    </div>
                    <div class="local_gaming" style="display: none;" id="game-cont">
                        <div id="countdown-overlay">
                            <div id="countdown-text">Ready</div>
                        </div>
                        <div class="user_info">
                            <div class="user1_info">
                                <!-- <p class="username">User Name</p> -->
                                <div class="score-dashes" id="player-dashes">
                                    <img src="../imgs_game/img/guestt.png" class="user1_img"><span id="player1-name-display"class="username">Player1</span>
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span>
                                </div>
                            </div>
                            <div class="user2_info">
                                <div class="score-dashes" id="ai-dashes">
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span id="player2-name-display"class="username2">Guest</span>
                                    <img src="../imgs_game/img/guestt.png" class="user2_img">
                                </div>
                            </div>            
                        </div>
                        <div class="score-container">
                            <div class="score-board">
                                <span id="player1-score">0</span> - <span id="player2-score">0</span>
                            </div>
                        </div>
                        <div class="game-container">
                            <canvas id="pong" width="800" height="400"></canvas>
                        </div>
                        <div id="home-button-container" style="display: none;">
                            <a class="button" id="home-button">Back to Home</a>
                        </div>
                        <div id="congratulations-modal" style="display: none;">
                            <div class="modal-content">
                                <p id="winner-message"></p>
                                <p id="winner-score"></p>
                                <button class ="congratsbutton" onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'squad_game':
                htmlContent = `
                    <div class="name-input-container">
                        <input class="player1-name" type="text" id="player1-name" placeholder="                   Enter Player 1 Name">
                        <input class="player2-name" type="text" id="player2-name" placeholder="                   Enter Player 2 Name">
                        <input class="player3-name" type="text" id="player3-name" placeholder="                   Enter Player 3 Name">
                        <input class="player4-name" type="text" id="player4-name" placeholder="                   Enter Player 4 Name">
                        <button class="start-game-button" id="start-game-button">Start game</button>
                    </div>
                    <div class="squad_gaming" style="display: none;" id="game-cont">
                        <div id="countdown-overlay">
                            <div id="countdown-text">Ready</div>
                        </div>
                        <div class="score-container">
                            <div class="score-board">
                                <span id="team1-score">0</span> - <span id="team2-score">0</span>
                            </div>
                        </div>
                        <div class="game-container">
                            <div class="team1_info">
                                <img src="../imgs_game/img/guestt.png" class="usert1_img"> <span id="player1-name-display" class="username">Player 1</span> <p class="keys">W <-> S </W-S></p>
                                <img src="../imgs_game/img/guestt.png" class="user1_img"> <span id="player2-name-display" class="username">Player 2</span> <p class="keys">V <-> B</p>
                            </div>
                            <canvas id="pong" width="800" height="400"></canvas>
                            <div class="team2_info">
                                <img src="../imgs_game/img/guestt.png" class="usert2_img"> <span id="player3-name-display" class="username">Player 3</span> <p class="keys">I <-> K</p>
                                <img src="../imgs_game/img/guestt.png" class="user2_img"> <span id="player4-name-display" class="username">Player 4</span> <p class="keys">UP <-> DOWN</p>
                            </div>
                        </div>
                        <div id="home-button-container" style="display: none;">
                            <a class="button" id="home-button">Back to Home</a>
                        </div>
                        <div id="congratulations-modal" style="display: none;">
                            <div class="modal-content">
                                <p id="winner-message"></p>
                                <p id="winner-score"></p>
                                <button class ="congratsbutton" onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'tournoi':
                htmlContent = `
                    <div class="name-input-container">
                        <input class="player1-name" type="text" id="player1-name" placeholder="                   Enter Player 1 Name">
                        <input class="player2-name" type="text" id="player2-name" placeholder="                   Enter Player 2 Name">
                        <input class="player3-name" type="text" id="player3-name" placeholder="                   Enter Player 3 Name">
                        <input class="player4-name" type="text" id="player4-name" placeholder="                   Enter Player 4 Name">
                        <button class="start-tournament-button" id="start-tournament-button">Start Tournament</button>
                    </div>
                        
                    <!-- Tournament Bracket -->
                    <div class="tournament-bracket" style="display: none;">
                        <div class="round round-left">
                            <div class="match" id="match1">
                                <span class="player player1">Player 1</span> vs. <span class="player player2">Player 2</span>
                            </div>
                            <div class="match" id="match2">
                                <span class="player player3">Player 3</span> vs. <span class="player player4">Player 4</span>
                            </div>
                        </div>
                        <div class="round round-right">
                            <div class="match" id="final-match">
                                <span class="player winner1">Winner 1</span> vs. <span class="player winner2">Winner 2</span>
                            </div>
                        </div>
                        <button class="start-match-button" id="start-match-button" style="display: none;">Start Next Match</button>
                    </div>
                    <div class="tournoi_gaming" style="display: none;" id="game-cont">
                        <div class="user_info">
                            <div class="user1_info">
                                <div class="score-dashes" id="player-dashes">
                                    <img src="../imgs_game/img/guestt.png" class="user1_img"><span id="player1-name-display"class = "username">Player 1</span>
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span>
                                </div>
                            </div>
                            <div class="user2_info">
                                <div class="score-dashes" id="ai-dashes">
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span id="player2-name-display" class="username2">Player 2</span>
                                    <img src="../imgs_game/img/guestt.png" class="user2_img">
                                </div>
                            </div>            
                        </div>
                        <div class="score-container">
                            <div class="score-board">
                                <span id="player1-score">0</span> - <span id="player2-score">0</span>
                            </div>
                        </div>
                        <div class="game-container">
                            <canvas id="pong" width="800" height="400"></canvas>
                        </div>
                        <button id="end-match-button" class="end-match-button" style="display: none;">End Match</button>
                        <div id="home-button-container" style="display: none;">
                            <a class="button" id="home-button">Back to Home</a>
                        </div>
                        <div id="congratulations-modal" style="display: none;">
                            <div class="modal-content">
                                <p id="winner-message"></p>
                                <p id="winner-score"></p>
                                <button class ="congratsbutton" onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'xo_game':
                htmlContent = `
                    <div class="name-input-container">
                        <input class="player1-name" type="text" id="player1-name" placeholder="                   Main User Name">
                        <input type="text" id="player2-name" class="player2-name" placeholder="                   Enter Player 2 Name">
                        <button class="start-game-button" id="start-game-button">Start Game</button>
                    </div>
                    <div class="xo_gaming" style="display: none;" id="game-cont">
                        <div class="user_info">
                            <div class="user1_info">
                                <!-- <p class="username">User Name</p> -->
                                <div class="score-dashes" id="player-dashes">
                                    <img src="../imgs_game/img/guestt.png" class="user1_img" id="user1_img"><span class="player-name-display" id="player1-name-display">Player 1</span>
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span>
                                </div>
                            </div>
                            <div class="user2_info">
                                <div class="score-dashes" id="ai-dashes">
                                    <span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="dash">_</span><span class="player-name-display" id="player2-name-display">Player 2</span>
                                    <img src="../imgs_game/img/robott.png" class="user2_img">
                                </div>
                            </div>            
                        </div>
                        <div class="score-container">
                            <div class="score-board">
                                <span id="player1-score">0</span> - <span id="player2-score">0</span>
                            </div>
                        </div>
                        <div class="game-container">
                            <div id="tic-tac-toe-board" class="tic-tac-toe-board"></div>
                            <!-- <canvas id="pong" width="800" height="400"></canvas> -->
                        </div>
                        <div id="home-button-container" style="display: none;">
                            <a class="button" id="home-button">Back to Home</a>
                        </div>
                        <div id="congratulations-modal" style="display: none;">
                            <div class="modal-content">
                                <p id="winner-message"></p>
                                <p id="winner-score"></p>
                                <button class ="congratsbutton" onclick="closeModal()">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
            default:
                console.error('No content for this game mode');
        }
        
        container.innerHTML = htmlContent;

        setTimeout(() => {
            const homeButton = this.shadowRoot.querySelector("#home-button");
            const gameModeContainer = this.shadowRoot.querySelector('#game-mode-container');

            if (homeButton) {
                homeButton.addEventListener("click", () => {
                    const event = new CustomEvent("gameEnded", { bubbles: true, composed: true });
                    document.dispatchEvent(event);
                    gameModeContainer.style.display = "none";
                });
            }
        }, 100);
        
        this.loadGameModeCSS(mode);
        this.loadGameModeJS(mode);
    }

    loadGameModeCSS(mode) {
        let existingLink = this.shadowRoot.querySelector("link[rel='stylesheet']");
        if (existingLink) {
            existingLink.href = `../modes/${mode}.css`; 
        } else {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `../modes/${mode}.css`;
            this.shadowRoot.appendChild(link);
        }
    }    
    
    
    loadGameModeJS(mode) {
        const existingScript = document.querySelector(`script[src="../modes/${mode}.js"]`);
        
        if (existingScript) {
            existingScript.remove(); 
            delete gameModeScriptsLoaded[mode]; 
        }
    
        const script = document.createElement("script");
        script.src = `../modes/${mode}.js`;
        script.onload = () => {
            gameModeScriptsLoaded[mode] = true;
        };
    
        document.body.appendChild(script);
    }
    
}

customElements.define('game-page', GamePage);
