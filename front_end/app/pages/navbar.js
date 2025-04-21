class CustomNavbar extends HTMLElement {
    constructor() {
        super();
        
        // Vérifier si l'utilisateur est connecté avant d'initialiser
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        this.attachShadow({ mode: "open" });
        
        // Récupérer la langue actuelle
        this.currentLang = localStorage.getItem('language') || 'en';

        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="bootstrap.min.css">
            <link rel="stylesheet" href="navbar.css">

            <div class="top-bar">
        <div class="logo-container">
            <img src="icon/logo.png" alt="Ping VS Pong Logo" class="logo">
        </div>
        <div class="search-container">
            <div class="search-bar">
                <img src="icon/loupe 2.png" alt="Search Icon" class="search-icon">
                <input type="text" placeholder="Search users..." class="search-input">
            </div>
            <div class="search-results"></div>
        </div>
        <div class="action-buttons">
            <div class="circle language-switch" id="btn-language">
                <span>${this.currentLang.toUpperCase()}</span>
            </div>
            <div class="circle">
                <img src="icon/bell 1.png" alt="Notification">
                <div class="notification-badge" style="display: none">0</div>
            </div>
            <div class="circle">
                <img src="icon/001-chat 1.png" alt="Chat">
            </div>
        </div>
    </div>
    <div class="w-auto sidenav">
        <div class="vertical-line left">
            <div class="circle" id="btn-home"><img src="icon/home 1.png" alt="Home"></div>
            <div class="circle" id="btn-profile"><img src="icon/002-user 1.png" alt="User"></div>
            <div class="circle" id="btn-chat"><img src="icon/001-chat 1.png" alt="Chat"></div>
            <div class="circle" id="btn-game"><img src="icon/gamepad 1.png" alt="Games"></div>
            <div class="circle" id="btn-settings"><img src="icon/setting-lines 1.png" alt="Settings"></div>
            <div class="circle" id="btn-logout"><img src="icon/power 1.png" alt="Logout"></div>
        </div>
    </div>
        `;

        this.setupEventListeners();

        // Initialiser la vérification des notifications avec un intervalle plus court
        this.initNotificationCheck();

        // Ajouter des écouteurs pour les mises à jour de notifications
        window.addEventListener('friendRequestAccepted', () => {
            this.checkFriendRequests();
        });

        window.addEventListener('friendRequestDeclined', () => {
            this.checkFriendRequests();
        });
    }

    setupEventListeners() {
        this.shadowRoot.querySelector("#btn-home").addEventListener("click", () => this.navigate("/home"));
        this.shadowRoot.querySelector("#btn-profile").addEventListener("click", () => this.navigate("/profile"));
        this.shadowRoot.querySelector("#btn-chat").addEventListener("click", () => this.navigate("/chat"));
        this.shadowRoot.querySelector("#btn-game").addEventListener("click", () => this.navigate("/game"));
        this.shadowRoot.querySelector("#btn-settings").addEventListener("click", () => this.navigate("/settings"));
        this.shadowRoot.querySelector("#btn-logout").addEventListener("click", () => this.logout());
        this.shadowRoot.querySelector("#btn-language").addEventListener("click", () => {
            this.toggleLanguage();
        });

        // Ajouter l'event listener pour la recherche
        const searchInput = this.shadowRoot.querySelector('.search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const searchValue = e.target.value.trim();
            
            const searchResults = this.shadowRoot.querySelector('.search-results');
            
            if (!searchValue) {
                searchResults.style.display = 'none';
                return;
            }

            searchTimeout = setTimeout(() => {
                this.searchUsers(searchValue);
            }, 300);
        });

        // Fermer les résultats quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!this.shadowRoot.contains(e.target)) {
                this.shadowRoot.querySelector('.search-results').style.display = 'none';
            }
        });

        // Ajouter un écouteur pour le bouton de notification
        const notificationBtn = this.shadowRoot.querySelector('.circle img[alt="Notification"]').parentElement;
        notificationBtn.addEventListener('click', () => {
            // Rediriger vers la page de profil qui affiche les demandes d'amis
            history.pushState({}, "", "/profile");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });

        // Ajouter un écouteur pour le bouton de chat dans la barre supérieure
        const chatBtn = this.shadowRoot.querySelector('.circle img[alt="Chat"]').parentElement;
        chatBtn.addEventListener('click', () => {
            history.pushState({}, "", "/chat");
            window.dispatchEvent(new PopStateEvent("popstate"));
        });
    }

    toggleLanguage() {
        // Rotation entre les trois langues
        let newLang;
        switch(this.currentLang) {
            case 'en':
                newLang = 'fr';
                break;
            case 'fr':
                newLang = 'es';
                break;
            case 'es':
                newLang = 'en';
                break;
            default:
                newLang = 'en';
        }
        
        this.currentLang = newLang;
        localStorage.setItem('language', newLang);
        
        // Mettre à jour l'affichage du bouton
        this.shadowRoot.querySelector("#btn-language span").textContent = newLang.toUpperCase();
        
        // Déclencher un événement pour informer les autres composants
        window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
    }

    navigate(page, username = null) {
        const url = username ? `${page}?username=${username}` : page;
        history.pushState({}, "", url);
        window.dispatchEvent(new PopStateEvent("popstate"));
        this.updateActiveButton(page);
    }

    async logout() {
        try{
            const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("csrftoken="))
            ?.split("=")[1];

            const response = await fetch("/authentication/logout/",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "X-CSRFToken": cookieValue,
                    }
                }
            )
            if(!response.ok) {
                console.error("Can't logout");
                return;
            }

            localStorage.removeItem("loggedIn");
            history.pushState({}, "", "/login");
            window.dispatchEvent(new PopStateEvent("popstate"));
        }catch(error){
            console.error("logout error:", error)
        }
    }

    updateActiveButton(page) {
        this.shadowRoot.querySelectorAll(".circle").forEach(btn => {
            btn.classList.remove("active");
        });
        const btnId = `#btn-${page.replace("/", "")}`;
        this.shadowRoot.querySelector(btnId)?.classList.add("active");
    }

    async searchUsers(query) {
        try {
            const response = await fetch(`/player_management/search_usernames/?username=${query}`, {
                credentials: 'include'
            });

            const data = await response.json();
            const searchResults = this.shadowRoot.querySelector('.search-results');
            
            if (!data || data.length === 0) {
                searchResults.innerHTML = '<div class="no-results">No users found</div>';
                searchResults.style.display = 'block';
                return;
            }

            searchResults.innerHTML = data.map(user => `
                <div class="search-result-item" data-username="${user.username}">
                    <img src="${user.avatar || 'icon/user.png'}" alt="${user.username}" class="result-avatar">
                    <span class="result-username">${user.username}</span>
                </div>
            `).join('');

            searchResults.style.display = 'block';

            // Ajouter les event listeners pour la navigation
            const resultItems = searchResults.querySelectorAll('.search-result-item');
            resultItems.forEach(item => {
                item.addEventListener('click', () => {
                    const username = item.dataset.username;
                    searchResults.style.display = 'none';
                    this.navigate(`/profile?username=${username}`);
                });
            });

        } catch (error) {
            console.error('Error searching users:', error);
        }
    }

    // Modifier la méthode initNotificationCheck
    initNotificationCheck() {
        // Ne démarrer les vérifications que si l'utilisateur est connecté
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        this.checkFriendRequests();
        this.notificationInterval = setInterval(() => {
            this.checkFriendRequests();
        }, 3000);
    }

    // Ajouter disconnectedCallback pour nettoyer l'intervalle
    disconnectedCallback() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
            this.notificationInterval = null;
        }
    }

    // Modifier la méthode checkFriendRequests
    async checkFriendRequests() {
        // Vérifier à nouveau la connexion avant chaque requête
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        try {
            const response = await fetch("/player_management/player_friendship_get/?target=invites", {
                method: "GET",
                credentials: "include",
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            const notificationBadge = this.shadowRoot.querySelector('.notification-badge');
            
            if (!notificationBadge) return;

            if (data.friendships && data.friendships.length > 0) {
                const newCount = data.friendships.length;
                
                // Ne mettre à jour que si le nombre a changé
                if (this.currentNotificationCount !== newCount) {
                    this.currentNotificationCount = newCount;
                    notificationBadge.style.display = 'flex';
                    notificationBadge.textContent = newCount;
                }
            } else {
                if (this.currentNotificationCount !== 0) {
                    this.currentNotificationCount = 0;
                    notificationBadge.style.display = 'none';
                }
            }
        } catch (error) {
            console.error("Error checking friend requests:", error);
        }
    }
}

// Définir le custom element
customElements.define("custom-navbar", CustomNavbar);
