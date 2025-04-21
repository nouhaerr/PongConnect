class SettingsPage extends HTMLElement {
    constructor() {
        super();
        
        // Vérifier si l'utilisateur est connecté avant d'initialiser
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        this.attachShadow({ mode: "open" });
        this.currentLang = localStorage.getItem('language') || 'en';
        this.userData = null;
        this.blockedUsers = [];

        // Vérifier que les traductions sont disponibles
        if (!translations) {
        }

        // Service d'avatar intégré
        this.avatarService = {
            updateAllAvatars: (newAvatarUrl) => {
                // Mettre à jour tous les avatars avec data-avatar="true"
                document.querySelectorAll('img[data-avatar="true"]').forEach(img => {
                    img.src = newAvatarUrl;
                });
                
                // Sauvegarder dans le localStorage
                localStorage.setItem('currentAvatar', newAvatarUrl);
            },
            
            getCurrentAvatar: () => {
                return localStorage.getItem('currentAvatar');
            }
        };

        const style = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                width: 100%;
            }

            * {
                box-sizing: border-box;
            }

            .settings-container {
                display: flex;
                flex-direction: column;
               
                height: 85vh;
                margin: 30px auto;
                padding: 40px;
                width: calc(100% - 80px) !important;
                margin-left: 80px;
                margin-top: 50px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                color: white;
                overflow-y: auto;
                animation: fadeIn 0.5s ease;
                scrollbar-width: thin;
                scrollbar-color: rgba(241, 196, 15, 0.5) rgba(0, 0, 0, 0.2);
                scroll-behavior: smooth;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .settings-title {
                font-size: 2.5rem;
                font-weight: bold;
                color: #f1c40f;
                margin-bottom: 40px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            }

            .settings-grid {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 40px;
                margin-bottom: 50px;
            }

            .avatar-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }

            .avatar-preview {
                position: relative;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                overflow: hidden;
                border: 4px solid #f1c40f;
                box-shadow: 0 4px 15px rgba(241, 196, 15, 0.3);
                transition: transform 0.3s ease;
            }

            .avatar-preview:hover {
                transform: scale(1.05);
            }

            .avatar-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: filter 0.3s ease;
            }

            .avatar-preview:hover img {
                filter: brightness(0.7);
            }

            .avatar-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .avatar-preview:hover .avatar-overlay {
                opacity: 1;
            }

            .upload-btn {
                background: #f1c40f;
                color: #000;
                border: none;
                border-radius: 25px;
                padding: 12px 25px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .upload-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(241, 196, 15, 0.4);
            }

            .info-section {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }

            .info-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .info-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }

            .info-label {
                font-size: 0.9rem;
                color: #f1c40f;
                margin-bottom: 8px;
            }

            .info-input {
                width: 100%;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(241, 196, 15, 0.3);
                border-radius: 8px;
                padding: 12px;
                color: white;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

            .info-input:focus {
                border-color: #f1c40f;
                box-shadow: 0 0 10px rgba(241, 196, 15, 0.2);
                outline: none;
            }

            .save-btn {
                background: #f1c40f;
                color: #000;
                border: none;
                border-radius: 25px;
                padding: 15px 40px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 30px;
            }

            .save-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(241, 196, 15, 0.3);
            }

            .account-section {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                padding: 30px;
                margin-top: 40px;
            }

            .section-title {
                font-size: 1.8rem;
                color: #f1c40f;
                margin-bottom: 25px;
            }

            .account-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }

            .account-item {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 20px;
                transition: all 0.3s ease;
            }

            .account-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }

            .danger-zone {
                margin-top: 40px;
                padding: 20px;
                border: 2px solid #e74c3c;
                border-radius: 15px;
            }

            .danger-title {
                color: #e74c3c;
                font-size: 1.4rem;
                margin-bottom: 20px;
            }

            .delete-btn {
                background: linear-gradient(45deg, #e74c3c, #c0392b);
                color: white;
                border: none;
                border-radius: 12px;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: auto;
            }

            .warning-btn {
                background: linear-gradient(45deg, #f39c12, #d35400);
                color: white;
                border: none;
                border-radius: 12px;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                font-size: 1.1rem;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-top: auto;
            }

            @keyframes dangerPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.6);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
                }
            }

            @keyframes warningPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(243, 156, 18, 0.6);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(243, 156, 18, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(243, 156, 18, 0);
                }
            }

            .delete-btn:hover, .warning-btn:hover {
                transform: translateY(-3px);
                letter-spacing: 2.5px;
            }

            .delete-btn:hover {
                background: linear-gradient(45deg, #c0392b, #e74c3c);
                box-shadow: 0 7px 25px rgba(231, 76, 60, 0.5);
            }

            .warning-btn:hover {
                background: linear-gradient(45deg, #d35400, #f39c12);
                box-shadow: 0 7px 25px rgba(243, 156, 18, 0.5);
            }

            .delete-btn:active, .warning-btn:active {
                transform: translateY(1px);
            }

            .account-item.danger, .account-item.warning {
                border: 2px solid;
                padding: 25px;
                border-radius: 15px;
                background: rgba(0, 0, 0, 0.2);
                display: flex;
                flex-direction: column;
                height: 100%;
                justify-content: space-between;
            }

            .account-item.danger {
                border-color: rgba(231, 76, 60, 0.5);
                background: rgba(231, 76, 60, 0.05);
            }

            .account-item.warning {
                border-color: rgba(243, 156, 18, 0.5);
                background: rgba(243, 156, 18, 0.05);
            }

            .account-item h3 {
                font-size: 1.8rem;
                margin-bottom: 15px;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
            }

            .account-item.danger h3 {
                color: #e74c3c;
            }

            .account-item.warning h3 {
                color: #f39c12;
            }

            .account-item p {
                font-size: 1.1rem;
                margin-bottom: 20px;
                color: rgba(255, 255, 255, 0.8);
            }

            @media (max-width: 1200px) {
                .settings-container {
                    width: calc(100% - 100px);
                }
                
                .settings-grid {
                    grid-template-columns: 1fr;
                }

                .info-section {
                    grid-template-columns: 1fr;
                }

                .account-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 768px) {
                .settings-container {
                    width: calc(100% - 40px);
                    padding: 20px;
                }

                .avatar-preview {
                    width: 150px;
                    height: 150px;
                }
            }

            /* Styles pour la fenêtre modale */
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
            }

            .modal-content {
                background: #320208;
                margin: 15% auto;
                padding: 20px;
                width: 70%;
                max-width: 500px;
                border-radius: 10px;
                position: relative;
                color: white;
            }

            .close-btn {
                position: absolute;
                right: 10px;
                top: 10px;
                font-size: 24px;
                cursor: pointer;
                color: #ffcc00;
            }

            .blocked-user {
                display: flex;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #444;
            }

            .blocked-user img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                margin-right: 10px;
            }

            .unblock-btn {
                margin-left: auto;
                padding: 5px 10px;
                background: #ffcc00;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            /* Styles pour Webkit (Chrome, Safari, etc.) */
            .settings-container::-webkit-scrollbar {
                width: 8px;
            }

            .settings-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                margin: 5px;
            }

            .settings-container::-webkit-scrollbar-thumb {
                background: linear-gradient(45deg, rgba(241, 196, 15, 0.5), rgba(243, 156, 18, 0.5));
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: padding-box;
            }

            .settings-container::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(45deg, rgba(241, 196, 15, 0.8), rgba(243, 156, 18, 0.8));
                border: 2px solid transparent;
                background-clip: padding-box;
            }

            /* Style pour Firefox */
            @supports (scrollbar-color: auto) {
                .settings-container {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(241, 196, 15, 0.5) rgba(0, 0, 0, 0.2);
                }
            }

            .error-input {
                border: 2px solid #e74c3c !important;
                background: rgba(231, 76, 60, 0.1) !important;
            }

            .error-message {
                color: #e74c3c;
                font-size: 0.85rem;
                margin-top: 5px;
                display: none;
                animation: fadeIn 0.3s ease;
            }

            .error-message.visible {
                display: block;
            }

            .info-input:disabled {
                opacity: 0.7;
                cursor: not-allowed;
                background: rgba(255, 255, 255, 0.05);
            }

            .oauth-info {
                font-size: 0.8rem;
                color: #f1c40f;
                margin-top: 5px;
                font-style: italic;
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
                animation: slideIn 0.5s ease;
            }

            .success-notification {
                background-color: #2ecc71;
            }

            .error-notification {
                background-color: #e74c3c;
            }

            .fade-out {
                opacity: 0;
                transition: opacity 0.5s ease;
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
        `;
        this.shadowRoot.appendChild(style);
        
        window.addEventListener('languageChange', (event) => {
            this.currentLang = event.detail;
            this.updateContent();
        });

        // Écouter l'événement de blocage d'utilisateur
        window.addEventListener('userBlocked', async (event) => {
            console.group('🔍 DEBUG: Réception événement userBlocked');
            
            // Recharger immédiatement la liste des utilisateurs bloqués
            await this.loadBlockedUsers();
            
            // Ouvrir automatiquement le modal pour montrer le changement
            const modal = this.shadowRoot.querySelector('#blocked-modal');
            if (modal) {
                modal.style.display = 'block';
            }
            
            console.groupEnd();
        });

        // Ajouter un écouteur pour les mises à jour de la liste des bloqués
        this.blockedCheckInterval = setInterval(async () => {
            if (this.shadowRoot.querySelector('#blocked-modal').style.display === 'block') {
                // Ne mettre à jour que si le modal est ouvert
                await this.loadBlockedUsers();
            }
        }, 3000);
    }

    async connectedCallback() {
        // Vérifier si l'utilisateur est connecté
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        try {
            await this.loadUserData();
            await this.updateContent();
            await this.loadBlockedUsers();
        } catch (error) {
            console.error('❌ Erreur d\'initialisation:', error);
        }
    }

    showLoadingState() {
        this.shadowRoot.innerHTML = `
            ${this.shadowRoot.querySelector('style')?.outerHTML || ''}
            <div class="settings-container">
                <h1 class="settings-title">${translations[this.currentLang].settings}</h1>
                <div class="loading-indicator">
                    <p>${translations[this.currentLang].loading || 'Loading...'}</p>
                </div>
            </div>
        `;
    }

    async loadUserData() {
        try {
            const response = await fetch('/player_management/settings/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            this.userData = await response.json();
            
            await this.updateContent();

        } catch (error) {
            console.error('❌ Erreur:', error.message);
        }
    }

    updateContent() {
        if (!this.userData) {
            console.warn('⚠️ Pas de données utilisateur disponibles');
            return;
        }

        const isOAuth = this.isOAuthUser();
        this.shadowRoot.innerHTML = `
            ${this.shadowRoot.querySelector('style')?.outerHTML || ''}
            <div class="settings-container">
                <h1 class="settings-title">${translations[this.currentLang].settings}</h1>
                
                <div class="settings-grid">
                    <div class="avatar-section">
                        <div class="avatar-preview">
                            <img src="${this.userData.avatar || 'icon/35.png'}" alt="User Avatar" id="profile-picture">
                            <div class="avatar-overlay">
                                <span>${translations[this.currentLang].change_avatar}</span>
                            </div>
                        </div>
                        <button class="upload-btn">${translations[this.currentLang].upload_new_avatar}</button>
                        <input type="file" id="file-input" style="display: none;">
                    </div>

                    <div class="info-section">
                        <div class="info-item">
                            <div class="info-label">${translations[this.currentLang].first_name}</div>
                            <input type="text" 
                                class="info-input" 
                                name="first_name"
                                value="${this.userData.first_name || ''}"
                                placeholder="${translations[this.currentLang].enter_first_name}">
                        </div>
                        <div class="info-item">
                            <div class="info-label">${translations[this.currentLang].last_name}</div>
                            <input type="text" 
                                class="info-input" 
                                name="last_name"
                                value="${this.userData.last_name || ''}"
                                placeholder="${translations[this.currentLang].enter_last_name}">
                        </div>
                        <div class="info-item">
                            <div class="info-label">${translations[this.currentLang].username}</div>
                            <input type="text" 
                                class="info-input" 
                                name="username"
                                value="${this.userData.username || ''}"
                                placeholder="${translations[this.currentLang].enter_username}">
                        </div>
                        <div class="info-item">
                            <div class="info-label">${translations[this.currentLang].email}</div>
                            <input type="email" 
                                class="info-input" 
                                name="email"
                                value="${this.userData.email || ''}"
                                placeholder="${translations[this.currentLang].enter_email}"
                                ${isOAuth ? 'disabled' : ''}>
                            ${isOAuth ? '<div class="oauth-info">Email linked to your 42 account</div>' : ''}
                        </div>

                        ${!isOAuth ? `
                            <div class="info-item">
                                <div class="info-label">${translations[this.currentLang].old_password}</div>
                                <input type="password" 
                                    class="info-input" 
                                    name="old_password"
                                    placeholder="${translations[this.currentLang].enter_current_password}">
                            </div>
                            <div class="info-item">
                                <div class="info-label">${translations[this.currentLang].new_password}</div>
                                <input type="password" 
                                    class="info-input" 
                                    name="new_password"
                                    placeholder="${translations[this.currentLang].enter_new_password}">
                            </div>
                            <div class="info-item">
                                <div class="info-label">${translations[this.currentLang].confirm_password}</div>
                                <input type="password" 
                                    class="info-input" 
                                    name="confirm_password"
                                    placeholder="${translations[this.currentLang].confirm_new_password}">
                            </div>
                        ` : ''}
                        <button class="save-btn">${translations[this.currentLang].save_changes}</button>
                    </div>
                </div>

                <div class="account-section">
                    <h2 class="section-title">${translations[this.currentLang].account_settings}</h2>
                    <div class="account-grid">
                        <div class="account-item danger">
                            <h3>${translations[this.currentLang].delete_account}</h3>
                            <p>${translations[this.currentLang].delete_account_warning}</p>
                            <button class="delete-btn">${translations[this.currentLang].delete_account}</button>
                        </div>
                        <div class="account-item warning">
                            <h3>${translations[this.currentLang].blocked_users}</h3>
                            <p>${translations[this.currentLang].manage_blocked_users}</p>
                            <button id="view-blocked" class="warning-btn">${translations[this.currentLang].view_blocked_users}</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal pour les utilisateurs bloqués -->
            <div id="blocked-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${translations[this.currentLang].blocked_users}</h2>
                        <span class="close-btn">&times;</span>
                    </div>
                    <div id="blocked-users-list">
                        ${this.blockedUsers.length === 0 
                            ? `<div class="no-blocked">${translations[this.currentLang].no_blocked_users}</div>`
                            : this.blockedUsers.map(user => `
                                <div class="blocked-user">
                                    <img src="${user.avatar}" alt="${user.username}" class="blocked-avatar">
                                    <span class="blocked-username">${user.username}</span>
                                    <button class="unblock-btn" data-username="${user.username}">
                                        ${translations[this.currentLang].unblock}
                                    </button>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadBtn = this.shadowRoot.querySelector('.upload-btn');
        const fileInput = this.shadowRoot.querySelector('#file-input');
        const saveBtn = this.shadowRoot.querySelector('.save-btn');
        const deleteBtn = this.shadowRoot.querySelector('.delete-btn');
        const viewBlockedBtn = this.shadowRoot.querySelector('#view-blocked');
        const modal = this.shadowRoot.querySelector('#blocked-modal');
        const closeBtn = this.shadowRoot.querySelector('.close-btn');

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                // Prévisualisation immédiate
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.shadowRoot.querySelector('#profile-picture').src = e.target.result;
                };
                reader.readAsDataURL(file);

                // Upload au serveur
                await this.handleAvatarUpload(file);
            }
        });

        saveBtn.addEventListener('click', () => {
            this.saveUserData();
        });

        deleteBtn.addEventListener('click', async () => {
            if (confirm(translations[this.currentLang].confirm_delete)) {
                await this.handleDeleteAccount();
            }
        });

        viewBlockedBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        const unblockBtns = this.shadowRoot.querySelectorAll('.unblock-btn');
        unblockBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                if (username) {
                    this.handleUnblock(username);
                }
            });
        });
    }

    async saveUserData() {
        try {
            this.resetErrors();
            
            console.group('💾 Sauvegarde des données utilisateur');
            
            const formData = this.getFormData();
            const validationErrors = this.validateFormData(formData);
            
            if (Object.keys(validationErrors).length > 0) {
                this.displayErrors(validationErrors);
                throw new Error('Validation failed');
            }

            const response = await fetch('/player_management/editprofile/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) {
                if (response.status === 400) {
                    let errorData = typeof result === 'object' ? result : { error: result };
                    this.displayErrors(errorData);
                    throw new Error('Validation server error');
                }
                throw new Error(result.message || result.detail || 'Server error');
            }

            // Réinitialiser les champs de mot de passe
            this.resetPasswordFields();
            
            // Recharger les données utilisateur
            await this.loadUserData();
            
            // Afficher une notification de succès
            const notification = document.createElement('div');
            notification.className = 'success-notification';
            notification.textContent = translations[this.currentLang].changes_saved_successfully || 'Changes saved successfully';
            this.shadowRoot.appendChild(notification);

            // Faire disparaître la notification après 3 secondes
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 500);
            }, 3000);

        } catch (error) {
            console.error('❌ Erreur:', error);
            if (error.message !== 'Validation failed' && error.message !== 'Validation server error') {
                // Afficher une notification d'erreur
                const notification = document.createElement('div');
                notification.className = 'error-notification';
                notification.textContent = error.message;
                this.shadowRoot.appendChild(notification);

                // Faire disparaître la notification après 3 secondes
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }
        } finally {
            console.groupEnd();
        }
    }

    getFormData() {
        const formData = {
            first_name: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_first_name + '"]')?.value.trim() || '',
            last_name: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_last_name + '"]')?.value.trim() || '',
            username: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_username + '"]')?.value.trim() || '',
            email: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_email + '"]')?.value.trim() || '',
            old_password: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_current_password + '"]')?.value || '',
            new_password: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].enter_new_password + '"]')?.value || '',
            confirm_password: this.shadowRoot.querySelector('input[placeholder="' + translations[this.currentLang].confirm_new_password + '"]')?.value || ''
        };

        // Supprimer les champs de mot de passe si aucun n'est rempli
        if (!formData.old_password && !formData.new_password && !formData.confirm_password) {
            delete formData.old_password;
            delete formData.new_password;
            delete formData.confirm_password;
        }

        return formData;
    }

    validateFormData(data) {
        const errors = {};

        // Validation du prénom et nom (1-20 caractères)
        if (data.first_name && (data.first_name.length < 1 || data.first_name.length > 20)) {
            errors.first_name = 'First name must be between 1 and 20 characters';
        }

        if (data.last_name && (data.last_name.length < 1 || data.last_name.length > 20)) {
            errors.last_name = 'Last name must be between 1 and 20 characters';
        }

        // Validation du nom d'utilisateur (3-20 caractères)
        if (data.username) {
            if (data.username.length < 3 || data.username.length > 20) {
                errors.username = 'Username must be between 3 and 20 characters';
            }
            // Le message "A user with this username already exists" sera géré 
            // automatiquement par displayErrors() quand le serveur le renvoie
        }

        // Validation basique de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            errors.email = 'Invalid email format';
        }

        // Validation des mots de passe
        if (data.new_password || data.old_password || data.confirm_password) {
            if (!data.old_password) {
                errors.old_password = 'Current password is required';
            }
            if (!data.new_password) {
                errors.new_password = 'New password is required';
            }
            if (!data.confirm_password) {
                errors.confirm_password = 'Password confirmation is required';
            }
            if (data.new_password && data.new_password.length < 8) {
                errors.new_password = 'Password must be at least 8 characters long';
            }
            if (data.new_password !== data.confirm_password) {
                errors.confirm_password = 'Passwords do not match';
            }
        }

        return errors;
    }

    displayErrors(errors) {
        // Si l'erreur est au format {message: "..."}, la convertir au format {field: message}
        if (errors.message && typeof errors.message === 'string') {
            if (errors.message.toLowerCase().includes('username')) {
                errors = { username: errors.message };
            }
        }

        Object.entries(errors).forEach(([field, message]) => {
            // Chercher d'abord par name, puis par placeholder
            let input = this.shadowRoot.querySelector(`input[name="${field}"]`);
            if (!input) {
                input = this.shadowRoot.querySelector(`input[placeholder="${translations[this.currentLang]['enter_' + field]}"]`);
            }
            
            if (input) {
                input.classList.add('error-input');
                
                let errorDiv = input.parentElement.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    input.parentElement.appendChild(errorDiv);
                }

                // Gestion spécifique des erreurs de username
                if (field === 'username') {
                    const errorMessage = Array.isArray(message) ? message[0] : message;
                    if (errorMessage.includes('already taken') || errorMessage.includes('already exists')) {
                        errorDiv.textContent = 'This username is already taken';
                    } else {
                        errorDiv.textContent = errorMessage;
                    }
                } else {
                    errorDiv.textContent = Array.isArray(message) ? message[0] : message;
                }
                
                errorDiv.classList.add('visible');
            }
        });
    }

    resetErrors() {
        // Supprimer toutes les classes d'erreur et messages
        this.shadowRoot.querySelectorAll('.error-input').forEach(input => {
            input.classList.remove('error-input');
        });

        this.shadowRoot.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('visible');
        });
    }

    resetPasswordFields() {
        // Réinitialiser les champs de mot de passe
        const passwordFields = ['old_password', 'new_password', 'confirm_password'];
        passwordFields.forEach(field => {
            const input = this.shadowRoot.querySelector(`input[placeholder="${translations[this.currentLang]['enter_' + field]}"]`);
            if (input) {
                input.value = '';
            }
        });
    }

    async handleAvatarUpload(file) {
        console.group('🖼️ Upload d\'avatar');
        try {
            // Vérifications du fichier
            if (!file.type.startsWith('image/')) {
                throw new Error(translations[this.currentLang].invalid_file_type);
            }
            
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(translations[this.currentLang].file_too_large);
            }

            // Créer une promesse pour obtenir l'URL de prévisualisation
            const previewUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            // Afficher la prévisualisation temporaire
            const profilePicture = this.shadowRoot.querySelector('#profile-picture');
            profilePicture.src = previewUrl;

            // Sauvegarder l'ancienne URL
            this.oldAvatarUrl = this.userData.avatar;

            // Créer le FormData avec le nom d'utilisateur
            const formData = new FormData();
            formData.append('image', file);
            formData.append('username', this.userData.username);
            
            const response = await fetch('/player_management/editavatar/', {
                method: 'POST',
                cache: "no-cache",
                credentials: 'include',
                headers: {
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.warn('📝 Status:', response.status);
                console.warn('📝 Error Details:', errorData);
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (true) { // TODO(XENOBAS): use status code to indicate success
                // Ajouter un timestamp à l'URL pour forcer le rechargement
                const newAvatarUrl = result.avatar_url ?? this.oldAvatarUrl; // `${this.oldAvatarUrl}?t=${timestamp}`;
                
                // Mettre à jour l'avatar dans les données utilisateur
                this.userData.avatar = newAvatarUrl;

                // Émettre un événement pour mettre à jour tous les avatars
                const event = new CustomEvent('updateAvatar', {
                    detail: { 
                        newAvatarUrl,
                        oldAvatarUrl: this.oldAvatarUrl
                    }
                });
                window.dispatchEvent(event);

                // Mettre à jour l'interface
                // profilePicture.src = newAvatarUrl;
                
                this.showNotification('avatar_updated', 'success');
            }

        } catch (error) {
            console.error('❌ Erreur:', error.message);
            // En cas d'erreur, restaurer l'ancienne image
            this.shadowRoot.querySelector('#profile-picture').src = this.oldAvatarUrl;
            this.showNotification('error_updating_avatar', 'error');
        } finally {
            console.groupEnd();
        }
    }

    getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    showNotification(message, type = 'info') {
        // Vérifier si le message est une clé de traduction
        if (translations[this.currentLang] && translations[this.currentLang][message]) {
            message = translations[this.currentLang][message];
        }

        // Si le message est toujours undefined ou vide, utiliser le message d'erreur par défaut
        if (!message || message.trim() === '') {
            console.error('❌ Message de notification manquant');
            message = translations[this.currentLang].server_error;
        }

        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            animation: slideIn 0.3s ease;
            z-index: 1000;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Ajouter cette méthode pour mettre à jour la liste des utilisateurs bloqués
    updateBlockedUsersList(blockedUser) {
        const blockedList = this.shadowRoot.querySelector('#blocked-users-list');
        if (!blockedList) return;

        // Créer un nouvel élément pour l'utilisateur bloqué
        const newBlockedUser = document.createElement('div');
        newBlockedUser.className = 'blocked-user';
        newBlockedUser.innerHTML = `
            <img src="${blockedUser.avatar}" alt="${blockedUser.username}" class="blocked-avatar">
            <span class="blocked-username">${blockedUser.username}</span>
            <button class="unblock-btn" data-username="${blockedUser.username}">
                ${translations[this.currentLang].unblock}
            </button>
        `;

        // Ajouter l'élément à la liste
        blockedList.appendChild(newBlockedUser);

        // Mettre à jour le compteur si nécessaire
        const counter = this.shadowRoot.querySelector('.blocked-count');
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            counter.textContent = currentCount + 1;
        }
    }

    async loadBlockedUsers() {
        try {
            const response = await fetch('/player_management/player_friendship_get/?target=blocked', {
                method: 'GET',
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des utilisateurs bloqués');
            }

            const blockedList = this.shadowRoot.querySelector('#blocked-users-list');
            if (!blockedList) return;

            // Comparer les données actuelles avec les nouvelles données
            const currentBlockedUsers = Array.from(blockedList.querySelectorAll('.blocked-user'))
                .map(el => el.dataset.username);
            const newBlockedUsers = data.blocked_list?.map(user => user.username) || [];

            // Ne mettre à jour que si la liste a changé
            const hasChanged = JSON.stringify(currentBlockedUsers.sort()) !== JSON.stringify(newBlockedUsers.sort());

            if (hasChanged) {
                if (!data.blocked_list || data.blocked_list.length === 0) {
                    blockedList.innerHTML = `<div class="no-blocked">${translations[this.currentLang].no_blocked_users}</div>`;
                } else {
                    blockedList.innerHTML = data.blocked_list.map(user => `
                        <div class="blocked-user" data-username="${user.username}">
                            <img src="${user.avatar || 'icon/user.png'}" alt="${user.username}" class="blocked-avatar">
                            <span class="blocked-username">${user.username}</span>
                            <button class="unblock-btn" data-username="${user.username}">
                                ${translations[this.currentLang].unblock}
                            </button>
                        </div>
                    `).join('');

                    // Réattacher les écouteurs d'événements
                    this.initializeBlockedUsersEvents();
                }
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }

    async handleUnblock(username) {
        try {
            const response = await fetch('/player_management/unblockfriend/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Network response was not ok');
            }

            // Mise à jour de l'UI et notification
            const userElement = this.shadowRoot.querySelector(`.blocked-user[data-username="${username}"]`);
            if (userElement) {
                userElement.remove();
                
                const blockedList = this.shadowRoot.querySelector('#blocked-users-list');
                if (blockedList && !blockedList.children.length) {
                    blockedList.innerHTML = `<div class="no-blocked">${translations[this.currentLang].no_blocked_users}</div>`;
                }
            }

            this.showNotification(translations[this.currentLang].user_unblocked_can_add, 'success');

        } catch (error) {
            console.error('❌ Erreur lors du déblocage:', error);
            this.showNotification(translations[this.currentLang].error_unblocking_user, 'error');
        }
    }

    async handleDeleteAccount() {
        try {
            const response = await fetch('/player_management/deleteacc/', {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                }
            });

            if (!response.ok) {
                throw new Error(data.message || 'Network response was not ok');
            }

            // Nettoyage et redirection
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            this.showNotification('account_deleted', 'success');
            
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur lors de la suppression du compte:', error);
            this.showNotification('error_deleting_account', 'error');
        }
    }

    initializeBlockedUsersEvents() {
        const unblockBtns = this.shadowRoot.querySelectorAll('.unblock-btn');
        unblockBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const username = btn.dataset.username;
                if (username) {
                    this.handleUnblock(username);
                }
            });
        });
    }

    disconnectedCallback() {
        if (this.blockedCheckInterval) {
            clearInterval(this.blockedCheckInterval);
            this.blockedCheckInterval = null;
        }
    }

    // Ajouter cette méthode pour vérifier si l'utilisateur est connecté via OAuth
    isOAuthUser() {
        const is42User = this.userData?.email?.endsWith('@student.42.fr') || 
                        this.userData?.email?.endsWith('@student.1337.ma');
        return is42User;
    }
}

customElements.define("settings-page", SettingsPage);

