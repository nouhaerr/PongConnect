document.addEventListener("DOMContentLoaded", async () => {
    const pages = {
        login: document.querySelector("login-page"),
        home: document.querySelector("home-page"),
        profile: document.querySelector("profile-page"),
        chat: document.querySelector("chat-page"),
        game: document.querySelector("game-page"),
        settings: document.querySelector("settings-page"),
    };

    const navbar = document.createElement("custom-navbar");
    document.body.prepend(navbar);

    const pagesAvecNavbar = ["/home", "/profile", "/chat", "/game", "/settings"];

    function navigateTo(page, params = {}) {
        async function redirectUnauthorized() {
            if (window.location.pathname === "/login") return ;
            try {
                const resp = await fetch("/authentication/session-status/", {
                    credentials: "include",
                });

                if (!resp.ok) {
                    localStorage.removeItem("loggedIn");
                    window.location.pathname = "/login"; // Redirect if session is invalid
                    localStorage.setItem("loggedIn", "true");
                }
            } catch (error) {
                console.error("Session validation error:", error);
                localStorage.removeItem("loggedIn");
                window.location.pathname = "/login"; 
            }
        }

        redirectUnauthorized();

        // Extraire les paramètres de l'URL si présents
        const urlParams = new URLSearchParams(window.location.search);
        const urlUsername = urlParams.get('username');

        if (page === "profile") {
            const elements = document.getElementsByTagName("profile-page");
            for (const element of elements) {
                // Utiliser soit les paramètres passés, soit les paramètres d'URL
                const username = params.username || urlUsername;
                element.loadProfile?.(username);
                element.addEventListeners?.();
            }
        }

        // Cacher toutes les pages
        Object.values(pages).forEach(p => p.classList.remove("active"));

        // Afficher uniquement la page sélectionnée
        pages[page].classList.add("active");

        // Gérer l'affichage de la navbar
        navbar.style.display = pagesAvecNavbar.includes(`/${page}`) ? "block" : "none";
    }

    // Capture l'événement "navigate" pour rediriger dynamiquement
    document.addEventListener("navigate", (event) => {
        const { page, params } = event.detail;
        navigateTo(page, params);
    });

    // Modifier la gestion du popstate pour inclure les paramètres d'URL
    window.addEventListener("popstate", () => {
        const page = window.location.pathname.replace("/", "") || "home";
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        
        if (urlParams.has('username')) {
            params.username = urlParams.get('username');
        }
        
        navigateTo(page, params);
    });

    // Modifier la vérification de la page initiale pour inclure les paramètres d'URL
    const initialPage = window.location.pathname.replace("/", "") || "login";
    const initialUrlParams = new URLSearchParams(window.location.search);
    const initialParams = {};
    
    if (initialUrlParams.has('username')) {
        initialParams.username = initialUrlParams.get('username');
    }
    
    navigateTo(initialPage, initialParams);
});
