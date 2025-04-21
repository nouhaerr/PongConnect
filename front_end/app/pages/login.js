// Function to get the value of a specific cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchCSRFToken() {
    try {
        const response = await fetch("/authentication/csrf/", {
            method: "GET",
            credentials: "include",
        });

        if (response.status === 204) {
            console.log("✅ CSRF token successfully set in cookies");
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error("CSRF Fetch Error:", error);
    }
}

class LoginPage extends HTMLElement {;
    constructor() {
        super();
        this.trails = [];
        this.maxTrails = 5;
    }

    connectedCallback() {
        this.initializeUI();
        this.setupEventListeners();
        
        // Ne vérifier la redirection que si l'utilisateur est potentiellement connecté
        if (localStorage.getItem("loggedIn") === "true") {
            this.redirectAuthorized();
        }
        
        // Démarrer l'animation de trail
        setInterval(() => this.createTrail(), 50);
    }

    async redirectAuthorized() {
        try {
            const resp = await fetch("/authentication/session-status/", {
                credentials: "include",
            });

            if (resp.ok) {
                if (window.location.pathname === "/login") {
                    window.location.pathname = "/home";
                }
            } else {
                localStorage.removeItem("loggedIn");
            }
        } catch (error) {
            console.error("Error checking session status:", error);
            localStorage.removeItem("loggedIn");
        }
    }

    initializeUI() {
        this.innerHTML = `
            <style>
                .page-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    width: 100%;
                    position: fixed;
                    top: 0;
                    left: 0;
                }

                body {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(100deg, #62272D, #000000);
                }

                .login-container {
                    width: 90%;
                    max-width: 500px;
                    height: auto;
                    background: rgba(62, 27, 33, 0.85);
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    font-family: 'Poppins', sans-serif;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .btn, input {
                    width: 100%;
                    padding: 15px;
                    margin: 12px 0;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    height: 50px;
                    box-sizing: border-box;
                }
                input {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 2px solid transparent;
                    letter-spacing: 0.5px;
                    backdrop-filter: blur(5px);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                input::placeholder {
                    color: rgba(255, 255, 255, 0.6);
                    transition: all 0.3s ease;
                }
                input:focus {
                    outline: none;
                    border-color: #D64161;
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 0 15px rgba(214, 65, 97, 0.3);
                }
                input:focus::placeholder {
                    opacity: 0.7;
                    transform: translateX(10px);
                }
                .btn {
                    background: #D64161;
                    color: white;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    box-shadow: 0 4px 15px rgba(214, 65, 97, 0.2);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }
                .btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.4),
                        transparent
                    );
                    transition: 0.5s;
                }
                .btn:hover::before {
                    left: 100%;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(214, 65, 97, 0.3);
                    background: #E85F7C;
                }
                .btn-42 {
                    background: linear-gradient(45deg, #62272D, #8B2635);
                    color: white;
                    margin-bottom: 25px;
                    position: relative;
                    overflow: hidden;
                }
                .btn-42:hover {
                    background: linear-gradient(45deg, #8B2635, #62272D);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(214, 65, 97, 0.3);
                }
                h2#form-title {
                    font-size: 2.5rem;
                    font-weight: 600;
                    margin-bottom: 30px;
                    position: relative;
                    letter-spacing: 2px;
                    animation: titlePulse 2s infinite ease-in-out;
                }

                /* Style spécifique pour le titre Sign In */
                #signin-form:not(.hidden) ~ #form-title {
                    color: #D64161;
                    text-shadow: 0 0 10px rgba(214, 65, 97, 0.3);
                }

                /* Style spécifique pour le titre Sign Up */
                #signup-form:not(.hidden) ~ #form-title {
                    color: #8B2635;
                    text-shadow: 0 0 10px rgba(139, 38, 53, 0.3);
                }

                @keyframes titlePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes borderGlow {
                    0% { opacity: 0.5; }
                    50% { opacity: 1; }
                    100% { opacity: 0.5; }
                }

                p {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.8);
                    margin: 20px 0;
                }
                a {
                    color: #D64161;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
                a:hover {
                    color: #E85F7C;
                    text-shadow: 0 0 10px rgba(214, 65, 97, 0.5);
                }
                .hidden {
                    display: none;
                }
                .pong-container {
                    width: 200px;
                    height: 100px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 2px solid #ffcc00;
                    border-radius: 10px;
                    position: relative;
                    margin: 20px auto;
                    overflow: hidden;
                }

                .paddle {
                    width: 4px;
                    background: #ff;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                }

                .paddle-left {
                    left: 0;
                }

                .paddle-right {
                    right: 0;
                }

                .ball {
                    width: 8px;
                    height: 8px;
                    background: #ff;
                    border-radius: 50%;
                    position: absolute;
                    animation: moveBall 3s infinite linear;
                }

                @keyframes moveBall {
                    0%, 100% {
                        left: 20px;
                        top: 50%;
                    }
                    25% {
                        left: 50%;
                        top: 20%;
                    }
                    50% {
                        left: calc(100% - 20px);
                        top: 50%;
                    }
                    75% {
                        left: 50%;
                        top: 80%;
                    }
                }

                .ball-trail {
                    position: absolute;
                    width: 3px;
                    height: 3px;
                    background: rgba(255, 107, 53, 0.3);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .login-container::before {
                    content: '';
                    position: absolute;
                    top: -2px;
                    left: -2px;
                    right: -2px;
                    bottom: -2px;
                    background: linear-gradient(45deg, #62272D, #8B2635, #62272D);
                    z-index: -1;
                    border-radius: 22px;
                    animation: borderGlow 3s linear infinite;
                }

                .ball {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background-color: rgb(163, 180, 14);
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    animation: ballMove 3s infinite alternate cubic-bezier(0.42, 0, 0.58, 1);
                }

                .paddle {
                    position: absolute;
                    width: 10px;
                    height: 80px;
                    background-color: #ffcc00;
                    border-radius: 5px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                .left-paddle {
                    left: 10px;
                    animation: paddleMoveLeft 2s infinite alternate ease-in-out;
                }

                .right-paddle {
                    right: 10px;
                    animation: paddleMoveRight 2s infinite alternate ease-in-out;
                }

                @keyframes paddleMoveLeft {
                    0% {
                        top: calc(100% - 80px);
                    }
                    100% {
                        top: 0%;
                    }
                }

                @keyframes paddleMoveRight {
                    0% {
                        top: 0%;
                    }
                    100% {
                        top: calc(100% - 80px);
                    }
                }

                @keyframes ballMove {
                    0% {
                        left: 5%;
                        top: 10%;
                    }
                    100% {
                        left: 95%;
                        top: 90%;
                    }
                }

                .ball {
                    box-shadow: 0 0 20px rgba(255, 204, 0, 0.4);
                }

                .paddle {
                    background: #ffcc00;
                    box-shadow: 0 0 15px rgba(255, 204, 0, 0.3);
                }

                .switch-link-container {
                    margin-top: 25px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 204, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .switch-link-container:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 204, 0, 0.3);
                }

                .switch-link-container p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 15px;
                }

                .switch-link {
                    color: #ffcc00;
                    font-weight: 600;
                    padding: 5px 15px;
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    display: inline-block;
                    margin-left: 8px;
                }

                .switch-link:hover {
                    background: rgba(255, 204, 0, 0.1);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 204, 0, 0.2);
                }

                .success-notification, .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 25px;
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                }

                .success-notification {
                    background-color: #2ecc71;
                }

                .error-notification {
                    background-color: #e74c3c;
                }

                .fade-out {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .login-container {
                        width: 85%;
                        padding: 20px;
                    }

                    input, .btn {
                        padding: 12px;
                        font-size: 14px;
                    }

                    h2#form-title {
                        font-size: 2rem;
                    }
                }

                @media (max-width: 480px) {
                    .login-container {
                        width: 90%;
                        padding: 15px;
                    }

                    input, .btn {
                        padding: 10px;
                        font-size: 13px;
                        height: 40px;
                    }

                    h2#form-title {
                        font-size: 1.8rem;
                        margin-bottom: 20px;
                    }

                    .pong-container {
                        height: 150px;
                    }
                }

                /* Ajustements pour très petits écrans */
                @media (max-width: 320px) {
                    .login-container {
                        width: 95%;
                        padding: 10px;
                    }

                    .btn-42 {
                        margin-bottom: 15px;
                    }
                }
            </style>
            <div class="page-container">
                <div class="login-container">
                    <div class="paddle left-paddle"></div>
                    <div class="paddle right-paddle"></div>
                    <div class="ball"></div>
                    <h2 id="form-title">Sign in</h2>
                    
                    <div id="signin-form">
                        <button class="btn btn-42">Sign in with 42</button>
                        <p>Use your Username and Password</p>
                        <input type="text" placeholder="Username" id="login_username" required>
                        <input type="password" placeholder="Password" id="login_password" required>
                        <button class="btn btn-signin">SIGN IN</button>
                        <div class="switch-link-container">
                            <p>Don't have an account? <a href="#" class="switch-link" id="switch-to-signup">Sign Up</a></p>
                        </div>
                    </div>
                    
                    <div id="signup-form" class="hidden">
                        <input type="text" placeholder="Username" id="signup_username" required>
                        <input type="text" placeholder="Email" id="signup_email" required>
                        <input type="password" placeholder="Password" id="signup_password" required>
                        <input type="password" placeholder="Confirm Password" id="signup_confirm_password" required>
                        <button class="btn btn-signup">SIGN UP</button>
                        <div class="switch-link-container">
                            <p>Already have an account? <a href="#" class="switch-link" id="switch-to-signin">Sign In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async handle42Auth() {
        try {
            const resp = await fetch("/authentication/intra/");
            const href = (await resp.text()).slice(1, -1);
            window.location = href;
        } catch (error) {
            console.error("42 auth error:", error)
        }
    }

    setupEventListeners() {
        window.addEventListener('DOMContentLoaded', async () => {
            if (window.location.pathname === "/login") {
                const params = new URLSearchParams(window.location.search);
                if (params.has("code") || params.has("error")) {
                    // Must use code to attempt authentication with backend
                    const url = new URL("/authentication/intra/callback/", window.location.origin);
                    if (params.has("code"))
                        url.searchParams.set("code", params.get("code")?? "");
                    if (params.has("error"))
                        url.searchParams.set("error", params.get("error")?? "");
                    try {
                        const resp = await fetch(url, {
                            credentials: "include",
                        });
                        if (resp.ok) {
                            localStorage.setItem("loggedIn", true);
                            window.location.assign("/home");
                        } else {
                            throw new Error("error: " + resp.status + " " + resp.statusText);
                        }
                    } catch (error) {
                        alert("error: check console.");
                        console.error(error);
                    }
                    return ; //Prevent further execution
                }
            }
        });

        this.querySelector(".btn-signin").addEventListener("click", async () => {
            try {
                await fetchCSRFToken();
                const csrfToken = getCookie("csrftoken");

                const username = document.getElementById("login_username")?.value?.trim();
                const password = document.getElementById("login_password")?.value;

                if (!username || !password) {
                    this.showNotification("Username and password are required.");
                    return;
                }

                const resp = await fetch('/authentication/signin/', {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken || "",
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (resp.ok) {
                    localStorage.setItem("loggedIn", "true");
                    this.showNotification("Sign-in successful!", 'success');
                    window.location.pathname = "/home";
                } else {
                    localStorage.removeItem("loggedIn");
                    const data = await resp.json();
                    this.showNotification(data.error || "An error occurred during sign in.");
                }

            } catch (error) {
                console.error(error);
                localStorage.removeItem("loggedIn");
                this.showNotification("An error occurred. Please try again.");
            }
        });
        //  Sign Up 
        this.querySelector(".btn-signup").addEventListener("click", async () => {
            try {
                // Récupération du token CSRF
                await fetchCSRFToken();
                const csrfToken = getCookie("csrftoken");
                // Récupération des données du formulaire
                const username = document.getElementById("signup_username")?.value.trim();
                const email = document.getElementById("signup_email")?.value.trim();
                const password = document.getElementById("signup_password")?.value.trim();
                const confirm_password = document.getElementById("signup_confirm_password")?.value.trim();

                // Validation côté client
                if (!username || !email || !password || !confirm_password) {
                    this.showNotification("All fields are required.");
                    return;
                }

                // Validation de l'email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    this.showNotification("Please enter a valid email address.");
                    return;
                }

                if (password !== confirm_password) {
                    this.showNotification("Passwords do not match.");
                    return;
                }

                if (username.includes(" ")) {
                    this.showNotification("Username cannot contain spaces.");
                    return;
                }

                // Validation du mot de passe
                if (password.length < 8) {
                    this.showNotification("Password must be at least 8 characters long.");
                    return;
                }

                if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
                    this.showNotification("Password must contain at least one letter and one number.");
                    return;
                }

                // Envoi de la requête
                const resp = await fetch('/authentication/register/', {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken || "",
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        confirm_password
                    }),
                });

                const data = await resp.json();

                // Gestion des erreurs spécifiques
                if (data.username) {
                    this.showNotification(data.username[0]);
                    return;
                }
                if (data.email) {
                    this.showNotification(data.email[0]);
                    return;
                }
                if (data.password) {
                    this.showNotification(data.password[0]);
                    return;
                }

                // Vérification du statut de la réponse
                if (resp.status === 201) {
                    this.showNotification("Sign-up successful! Please log in.", 'success');
                    
                    document.getElementById("signup-form").classList.add("hidden");
                    document.getElementById("signin-form").classList.remove("hidden");
                    document.getElementById("form-title").innerText = "Sign In";
                } else {
                    this.showNotification(data.message || "Registration failed.");
                }

            } catch (error) {
                this.showNotification("An error occurred. Please try again.");
            }
        });

        // 🔹 Switch entre Sign In et Sign Up
        this.querySelector("#switch-to-signup").addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("signin-form").classList.add("hidden");
            document.getElementById("signup-form").classList.remove("hidden");
            document.getElementById("form-title").innerText = "Sign Up";
        });

        this.querySelector("#switch-to-signin").addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("signup-form").classList.add("hidden");
            document.getElementById("signin-form").classList.remove("hidden");
            document.getElementById("form-title").innerText = "Sign In";
        });
        this.querySelector(".btn-42").addEventListener("click", this.handle42Auth)
    }

    createTrail() {
        const ball = this.querySelector('.ball');
        const container = this.querySelector('.pong-container');
        
        if (ball && container) {
            const ballRect = ball.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const trail = document.createElement('div');
            trail.className = 'ball-trail';
            trail.style.left = (ballRect.left - containerRect.left) + 'px';
            trail.style.top = (ballRect.top - containerRect.top) + 'px';
            
            container.appendChild(trail);
            this.trails.push(trail);

            if (this.trails.length > this.maxTrails) {
                container.removeChild(this.trails.shift());
            }

            setTimeout(() => {
                if (trail.parentNode === container) {
                    container.removeChild(trail);
                    const index = this.trails.indexOf(trail);
                    if (index > -1) {
                        this.trails.splice(index, 1);
                    }
                }
            }, 200);
        }
    }

    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = type === 'success' ? 'success-notification' : 'error-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

customElements.define("login-page", LoginPage);
