class ChatPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        // Ajout des styles CSS (vide pour l'instant)
        const style = document.createElement("style");
        style.textContent = `
            /* Ajoute ton CSS ici */
        `;

        // Ajout de l'HTML
        const container = document.createElement("div");
        container.innerHTML = `
            <section id="chat" class="page">
                <h1>Chat Page</h1>
                <p>Coming Soon...</p>
            </section>
        `;

        // Ajout du style et du contenu HTML au Shadow DOM
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(container);
    }
}

// Définir le composant
customElements.define("chat-page", ChatPage);
