class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Charger la langue actuelle
        this.currentLang = localStorage.getItem('language') || 'en';
        
        // Écouter les changements de langue
        window.addEventListener('languageChange', (event) => {
            this.currentLang = event.detail;
            this.updateContent();
        });

        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "home.css");
        this.shadowRoot.appendChild(link);

        this.updateContent();
    }

    async fetchTopPlayers() {
        // Vérifier si l'utilisateur est connecté
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        try {
            const response = await fetch("/player_management/get_top_players/", {
                method: "GET",
                credentials: "include"
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const topPlayers = await response.json();
            

            this.renderTopPlayers(topPlayers);
        } catch (error) {
            console.error("Error fetching top players:", error);
        }
    }
    

    renderTopPlayers(players) {
        const playersContainer = this.shadowRoot.querySelector(".top-players");
    
        if (!playersContainer) return;
    
        let playersHTML = `
            <h2 class="section-title">${translations[this.currentLang].top_players}</h2>
        `;
    
        // Function to determine rank color
        const getRankColor = (rank) => {
            switch (rank.toLowerCase()) {
                case 'bronze':
                    return 'bronze';
                case 'silver':
                    return 'silver';
                case 'gold':
                    return 'gold';
                case 'platinum':
                    return 'platinum';
                case 'diamond':
                    return 'diamond';
                default:
                    return 'default';
            }
        };
    
        players.forEach((player) => {
            playersHTML += `
                <div class="player-card">
                    <img src="${player.image || 'icon/default-avatar.png'}" alt="${player.username}" class="player-avatar">
                    <div class="player-info">
                        <h3 style="color: white;">${player.username}</h3>
                        <p style="color: white;">Level: ${player.level}</p>
                        <p style="color: yellow;">Rank: ${player.rank}</p>
                    </div>
                </div>
            `;
        });
    
        playersContainer.innerHTML = playersHTML;
    }
    
    

    updateContent() {
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="bootstrap.min.css">
            <link rel="stylesheet" href="home.css">
           <section id="home" class="page active">
            <div class="game-section">
                <div class="game-content">
                    <div class="text-content">
                        <h1>${translations[this.currentLang].online_ping_pong}</h1>
                        <p>${translations[this.currentLang].game_description}</p>
                        <button class="play-now-btn">${translations[this.currentLang].play_now}</button>
                    </div>
                    <div class="image-content">
                        <img src="icon/big.png" alt="Ping Pong Character">
                    </div>
                </div>
            </div>
        
            <div class="p-2">
                <div class="row g-4">
                    <div class="col-lg-9 col-md-12 col-sm-12">
                        <div class="card-container">
                            <h2 class="section-title">${translations[this.currentLang].battle_mode}</h2>
                            <div class="cards-wrappe">
                                <div class="row g-4">
                                    <div class="col-lg-4 col-md-4 col-sm-12">
                                        <div class="card">
                                            <img src="icon/XX.png" alt="Deathmatch Icon">
                                            <h2>${translations[this.currentLang].deathmatch}</h2>
                                            <p>${translations[this.currentLang].deathmatch_description}</p>
                                            <button>${translations[this.currentLang].play_now}</button>
                                        </div>
                                    </div>
                                    <div class="col-lg-4 col-md-4 col-sm-12">
                                        <div class="card">
                                            <img src="icon/FF.png" alt="Overdrive Icon">
                                            <h2>${translations[this.currentLang].overdrive}</h2>
                                            <p>${translations[this.currentLang].overdrive_description}</p>
                                            <button>${translations[this.currentLang].play_now}</button>
                                        </div>
                                    </div>
                                    <div class="col-lg-4 col-md-4 col-sm-12">
                                        <div class="card">
                                            <img src="icon/11.png" alt="Jackpot Icon">
                                            <h2>${translations[this.currentLang].jackpot}</h2>
                                            <p>${translations[this.currentLang].jackpot_description}</p>
                                            <button>${translations[this.currentLang].play_now}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-md-12 col-sm-12 d-flex">
                        <div class="top-players">
                            <h2 class="section-title">${translations[this.currentLang].top_players}</h2>
                            <p>Loading...</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;

        this.fetchTopPlayers();
        this.initCardAnimations();
    }

    connectedCallback() {
        this.initCardAnimations();
        this.fetchTopPlayers();
    }

    initCardAnimations() {
        const cards = this.shadowRoot.querySelectorAll('.card');

        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.1) rotate(2deg)';
                card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.5)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1) rotate(0deg)';
                card.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.5)';
            });

            card.addEventListener('click', () => {
                card.style.transform = 'scale(1.2) rotate(-2deg)';

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        card.style.transform = 'scale(1) rotate(0deg)';
                    }, 150);
                });
            });
        });
    }

    initEventListeners() {
        // Sélectionner tous les boutons "Play Now" (le bouton principal et les boutons des cartes)
        const allPlayButtons = this.shadowRoot.querySelectorAll('.play-now-btn, .card button');

        allPlayButtons.forEach((button) => {
            button.addEventListener("click", () => {
                // Utiliser history.pushState pour la navigation SPA
                history.pushState({}, "", '/game');
                // Déclencher l'événement popstate pour que le routeur gère la navigation
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        });
    }


    // Ajouter une méthode pour démarrer l'intervalle
    startTopPlayersInterval() {
        // Première récupération immédiate
        this.fetchTopPlayers();
        
        // Mettre en place l'intervalle de mise à jour
        this.topPlayersInterval = setInterval(() => {
            // Vérifier si l'utilisateur est toujours connecté
            if (localStorage.getItem("loggedIn") !== "true") {
                // Si déconnecté, arrêter l'intervalle
                this.stopTopPlayersInterval();
                return;
            }
            
            this.fetchTopPlayers();
        }, 3000);
    }

    // Ajouter une méthode pour arrêter l'intervalle
    stopTopPlayersInterval() {
        if (this.topPlayersInterval) {
            clearInterval(this.topPlayersInterval);
            this.topPlayersInterval = null;
        }
    }

    connectedCallback() {
        this.initCardAnimations();
        this.fetchTopPlayers();
        this.initEventListeners();
        this.startTopPlayersInterval(); // Démarrer l'intervalle quand le composant est connecté
    }

    disconnectedCallback() {
        this.stopTopPlayersInterval(); // Arrêter l'intervalle quand le composant est déconnecté
    }
}

customElements.define("home-page", HomePage);