class ProfilePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        
        // Charger la langue actuelle
        this.currentLang = localStorage.getItem('language') || 'en';
        
        // Initialiser les traductions
        this.initTranslations();

        // Écouter les changements de langue
        window.addEventListener('languageChange', (event) => {
            this.currentLang = event.detail;
            this.updateContent();
            this.disconnectedCallback();
        });

        // Écouter les mises à jour d'avatar
        window.addEventListener('updateAvatar', (event) => {
            const { newAvatarUrl, oldAvatarUrl } = event.detail;
            
            // Mettre à jour tous les avatars dans le composant
            const avatars = this.shadowRoot.querySelectorAll('img');
            avatars.forEach(avatar => {
                // Ne mettre à jour que les avatars qui correspondent à l'ancien avatar
                if (avatar.src.includes(oldAvatarUrl) || 
                    avatar.classList.contains('profile-avatar') || 
                    avatar.classList.contains('player-avatar')) {
                    avatar.src = newAvatarUrl;
                }
            });
        });

        // Ajouter une propriété pour suivre l'état de la modale
        this.isModalOpen = false;
        
        // Créer et ajouter le style une seule fois
        const style = document.createElement("style");
        style.textContent = `
   
            :host {
                display: block;
                width: 100%;
            }

            * {
                box-sizing: border-box;
            }
        
            .profile-container {
                margin: 30px auto;
                width: calc(100% - 80px);
        
                margin-left: 80px;
                margin-top: 100px;
                height: 85vh;
                overflow-y: auto;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                color: white;
                animation: fadeIn 0.6s ease;
                overflow-y: auto;
            }
            .profile-header {
               
                align-items: center;
                margin-bottom: 40px;
            }

            .avatar-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .avatar-wrapper {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                border: 4px solid #FFD700;
                overflow: hidden;
                animation: fadeIn 0.8s ease;
            }

            .profile-avatar {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid #FFD700;
                object-fit: cover;
            }

            .profile-name {
                font-size: 2rem;
                color: #FFD700;
                margin: 5px 0;
                animation: fadeIn 1s ease;
            }

            .level-section {
                flex: 1;
                width: 100%;
                animation: slideIn 1s ease;
            }

            .level-title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                text-transform: uppercase;
            }

            .progress-bar {
                width: 100%;
                height: 20px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                overflow: hidden;
                box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
                margin: 10px 0;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #FFD700, #FFA500);
                transition: width 1.5s ease-out, background 0.5s ease;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
            }

            .progress-text {
                color: white;
                font-size: 1.2rem;
                margin-top: 10px;
                font-weight: 500;
                letter-spacing: 1px;
                text-align: center;
            }

            .stats-grid {
                
                margin: 30px 0;
            }

            .stat-box {
                background: rgba(61, 19, 19, 0.5);
                padding: 20px;
                text-align: center;
                border-radius: 10px;
                animation: fadeIn 1.2s ease;
                transition: all 0.3s ease;
            }

            .stat-box:hover {
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            .stat-value {
                font-size: 2.5rem;
                color: #FFD700;
                margin-bottom: 5px;
                transition: color 0.3s ease, text-shadow 0.3s ease;
            }
            
            .total_wins {
                font-size: 2.5rem;
                color: #FFD700;
                margin-bottom: 5px;
            }
            
            .total_losses {
                font-size: 2.5rem;
                color: #FFD700;
                margin-bottom: 5px;
            }

            .stat-label {
                color: white;
                text-transform: uppercase;
                font-size: 0.9rem;
            }

            .content-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }

            .section-title {
                color: #FFD700;
                font-size: 1.5rem;
                margin-bottom: 20px;
            }

            .match-item, .friend-item {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                transition: transform 0.3s ease;
                animation: slideIn 0.5s ease;
                width: 100%;  /* Ajout */
                box-sizing: border-box;  /* Ajout */
                min-width: 0;  /* Ajout */
            }

            .match-item:hover, .friend-item:hover {
                transform: translateX(5px);
                background: rgba(255, 255, 255, 0.05);
            }

            .player-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 2px solid #FFD700;
            }

            .match-details {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 5px;
                min-width: 0;  /* Ajout */
                overflow: hidden;  /* Ajout */
            }

            .match-line {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .vs-text {
                color: #FFD700;
                font-size: 1.2em;
            }

            .vs-opponent {
                color: white;
                font-size: 1.1em;
                white-space: nowrap;  /* Ajout */
                overflow: hidden;  /* Ajout */
                text-overflow: ellipsis;  /* Ajout */
            }

            .score-label {
                color: #FFD700;
                font-size: 1.1em;
            }

            .score {
                color: white;
                font-size: 1.1em;
            }

            .result-badge {
                padding: 5px 15px;
                border-radius: 15px;
                font-size: 0.9rem;
            }

            .win { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
            .loss { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }

            .friend-request {
                display: flex;
                align-items: center;
                gap: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 10px;
                transition: all 0.3s ease;
                animation: slideIn 0.6s ease;
            }

            .friend-request:hover {
                background: rgba(0, 0, 0, 0.4);
                transform: translateX(5px);
            }

            .request-avatar {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 2px solid #FFD700;
            }

            .request-info {
                flex: 1;
            }

            .request-name {
                color: #FFD700;
                font-size: 1.2rem;
                margin-bottom: 5px;
                font-weight: bold;
            }

            .request-status {
                color: #ffffff;
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .request-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .btn {
                padding: 8px 20px;
                border-radius: 20px;
                border: none;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .accept {
                background: #2ecc71;
                color: white;
            }

            .accept:hover {
                background: #27ae60;
                transform: translateY(-2px);
                box-shadow: 0 3px 10px rgba(46, 204, 113, 0.3);
            }

            .decline {
                background: #e74c3c;
                color: white;
            }

            .decline:hover {
                background: #c0392b;
                transform: translateY(-2px);
                box-shadow: 0 3px 10px rgba(231, 76, 60, 0.3);
            }

            @media (max-width: 1200px) {
                .content-grid {
                    grid-template-columns: 1fr;
                }
                .stats-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }

            .profile-actions {
                display: flex;
                flex-direction: column;
                gap: 20px;
                min-width: 200px;
                margin-left: auto;
            }

            .edit-profile-btn {
                position: absolute;
                top: 40px;
                right: calc(100px + 5%);
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: black;
                padding: 12px 30px;
                border-radius: 30px;
                border: none;
                font-weight: bold;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
                animation: fadeIn 0.8s ease;
            }

            .edit-profile-btn:hover {
                transform: translateY(-2px) scale(1.05);
                background: linear-gradient(45deg, #FFA500, #FFD700);
                box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
            }

            .quick-stats {
                display: flex;
                flex-direction: column;
                gap: 15px;
                align-items: flex-end;
            }

            .quick-stat-item {
                color: white;
                font-size: 1rem;
                padding: 12px 25px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 20px;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative;
                overflow: hidden;
                cursor: pointer;
                width: 100%;
                text-align: left;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .quick-stat-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 215, 0, 0.1),
                    transparent
                );
                transition: 0.5s;
            }

            .quick-stat-item:hover {
                transform: translateX(-10px);
                background: rgba(255, 215, 0, 0.1);
                border-color: #FFD700;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
            }

            .quick-stat-item:hover::before {
                left: 100%;
            }

            @keyframes statPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(255, 215, 0, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
                }
            }

            .quick-stat-item:nth-child(2) {
                animation: statPulse 2s infinite;
            }

            .quick-stat-item:nth-child(3) {
                animation: statPulse 2s infinite 0.6s;
            }

            .quick-stat-item:nth-child(4) {
                animation: statPulse 2s infinite 1.2s;
            }

            .quick-stat-item i {
                margin-left: 8px;
                color: #FFD700;
                font-size: 1.2rem;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes slideIn {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes glowPulse {
                0% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
                50% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
                100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
            }

            .section {
                animation: fadeIn 1.4s ease;
                height: 400px;  /* ou la hauteur que vous souhaitez */
            }

            @keyframes progressFill {
                from { width: 0; }
                to { width: 75%; }
            }

            .friends-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }

            .modal-content {
                background: rgba(30, 30, 30, 0.95);
                border-radius: 15px;
                width: 80%;
                max-width: 800px;
                height: 80vh;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                animation: modalFadeIn 0.3s ease;
                display: flex;
                flex-direction: column;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 30px;
                border-bottom: 1px solid rgba(255, 215, 0, 0.2);
                flex-shrink: 0;
            }

            .modal-header h2 {
                color: #FFD700;
                margin: 0;
                font-size: 1.8rem;
            }

            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }

            .close-modal:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #FFD700;
            }

            .modal-body {
                padding: 30px;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
            }

            .friend-search {
                width: 50%;
                min-width: 300px;
                padding: 15px 20px;
                font-size: 1.1rem;
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                background: rgba(0, 0, 0, 0.3);
                color: white;
                flex-shrink: 0;
                margin-bottom: 20px;
            }

            .friend-search:focus {
                outline: none;
                border-color: #FFD700;
            }

            .friends-list {
                flex: 1;
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 20px;
                padding: 10px;
            }

            .friend-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                border-bottom: 1px solid #eee;
            }

            .friend-info {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
                padding: 5px;
                transition: background-color 0.2s;
            }

            .friend-info:hover {
                background-color: rgba(0, 0, 0, 0.05);
                border-radius: 5px;
            }

            .friend-info img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                object-fit: cover;
            }

            .friend-info span {
                font-size: 16px;
                color: #333;
            }

            .friend-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                margin-right: 20px;
                border: 2px solid #FFD700;
            }

            .friend-name {
                color: #FFD700;
                font-size: 1.3em;
                margin-bottom: 5px;
            }

            .friend-status {
                color: rgba(255, 255, 255, 0.7);
                font-size: 1em;
            }

            .add-friend-btn {
                background: linear-gradient(45deg, #FFD700, #FFA500);
                color: black;
                border: none;
                padding: 10px 20px;
                font-size: 1.1em;
                border-radius: 20px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }

            .add-friend-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
            }

            @keyframes modalFadeIn {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .block-button {
                margin-left: auto;
                padding: 8px 16px;
                background-color: #e74c3c;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
            }

            .block-button:hover {
                background-color: #c0392b;
                transform: translateY(-2px);
            }

            .block-button i {
                font-size: 1rem;
            }

            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }

            .content-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
            }

            .section-content {
                height: calc(100% - 50px);
                overflow-y: auto;
                overflow-x: hidden;  /* Empêche le scroll horizontal */
                padding-right: 10px;
                width: 100%;
                box-sizing: border-box;
                
                /* Style moderne pour la scrollbar */
                scrollbar-width: thin;
                scrollbar-color: #FFD700 rgba(0, 0, 0, 0.2);
                
                /* Pour Chrome/Safari/Edge */
                &::-webkit-scrollbar {
                    width: 6px;
                }

                &::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 3px;
                }

                &::-webkit-scrollbar-thumb {
                    background: #FFD700;
                    border-radius: 3px;
                    
                    &:hover {
                        background: #ffd900d3;
                    }
                }
            }

            @media (max-width: 1200px) {
                .content-grid {
                    grid-template-columns: 1fr;
                }
            }

            .stat-value.bronze {
                color: #CD7F32;
                text-shadow: 0 0 10px rgba(205, 127, 50, 0.4);
            }

            .stat-value.silver {
                color: #C0C0C0;
                text-shadow: 0 0 10px rgba(192, 192, 192, 0.4);
            }

            .stat-value.gold {
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
            }

            .stat-value.platinum {
                color: #E5E4E2;
                text-shadow: 0 0 10px rgba(229, 228, 226, 0.4);
            }

            .stat-value.diamond {
                color: #B9F2FF;
                text-shadow: 0 0 10px rgba(185, 242, 255, 0.4);
            }

            .game-mode {
                font-size: 0.9em;
                color: #FFD700;
                opacity: 0.8;
                margin-top: 5px;
            }

            .rank-bronze {
                color: #CD7F32;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .rank-silver {
                color: #C0C0C0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .rank-gold {
                color: #FFD700;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .rank-platinum {
                color: #E5E4E2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .rank-diamond {
                color: #B9F2FF;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .rank-default {
                color: #808080;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
            }

            .stat-box .stat-value.rank-bronze {
                color: #CD7F32 !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(139, 69, 19, 0.3);
            }

            .stat-box .stat-value.rank-silver {
                color: #C0C0C0 !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(128, 128, 128, 0.3);
            }

            .stat-box .stat-value.rank-gold {
                color: #FFD700 !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(255, 215, 0, 0.3);
            }

            .stat-box .stat-value.rank-platinum {
                color: #E5E4E2 !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(229, 228, 226, 0.3);
            }

            .stat-box .stat-value.rank-diamond {
                color: #B9F2FF !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(185, 242, 255, 0.3);
            }

            .stat-box .stat-value.rank-default {
                color: #808080 !important;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(128, 128, 128, 0.3);
            }

            /* Styles pour la barre de progression */
            .progress-fill.rank-bronze {
                background: linear-gradient(90deg, #CD7F32, #8B4513) !important;
            }

            .progress-fill.rank-silver {
                background: linear-gradient(90deg, #C0C0C0, #808080) !important;
            }

            .progress-fill.rank-gold {
                background: linear-gradient(90deg, #FFD700, #FFA500) !important;
            }

            .progress-fill.rank-platinum {
                background: linear-gradient(90deg, #E5E4E2, #B9F2FF) !important;
            }

            .progress-fill.rank-diamond {
                background: linear-gradient(90deg, #B9F2FF, #4169E1) !important;
            }

            .status {
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 14px;
                font-weight: 500;
                margin-top: 5px;
            }

            .status.online {
                background-color: #2ecc71;
                color: white;
            }

            .status.offline {
                background-color: #e74c3c;
                color: white;
            }

            /* Styles pour les boutons d'action */
            .profile-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Effet hover général */
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }

            /* Effet click */
            .btn:active {
                transform: translateY(0);
            }

            /* Add Friend Button */
            .add-friend-btn {
                background: linear-gradient(45deg,rgb(3, 26, 12), #27ae60);
                color: white;
            }

            .add-friend-btn:hover {
                background: linear-gradient(45deg, #27ae60, #2ecc71);
            }

            /* Cancel Request Button */
            .cancel-request-btn {
                background: linear-gradient(45deg,rgb(60, 217, 231),rgb(117, 25, 25));
                color: white;
            }

            .cancel-request-btn:hover {
                background: linear-gradient(45deg, #c0392b, #e74c3c);
            }

            /* Accept Button */
            .accept-btn {
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
            }

            .accept-btn:hover {
                background: linear-gradient(45deg, #2980b9, #3498db);
            }

            /* Decline Button */
            .decline-btn {
                background: linear-gradient(45deg, #95a5a6, #7f8c8d);
                color: white;
            }

            .decline-btn:hover {
                background: linear-gradient(45deg, #7f8c8d, #95a5a6);
            }

            /* Block Button */
            .block-btn {
                background: linear-gradient(45deg,rgb(230, 34, 109),rgb(211, 0, 0));
                color: white;
            }

            .block-btn:hover {
                background: linear-gradient(45deg, #d35400, #e67e22);
            }

            /* Unblock Button */
            .unblock-btn {
                background: linear-gradient(45deg, #9b59b6, #8e44ad);
                color: white;
            }

            .unblock-btn:hover {
                background: linear-gradient(45deg, #8e44ad, #9b59b6);
            }

            /* Unfriend Button */
            .unfriend-btn {
                background: linear-gradient(45deg, #f1c40f, #f39c12);
                color: white;
            }

            .unfriend-btn:hover {
                background: linear-gradient(45deg, #f39c12, #f1c40f);
            }

            /* Animation d'onde au clic */
            .btn::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.6s ease-out, height 0.6s ease-out;
            }

            .btn:active::after {
                width: 200px;
                height: 200px;
                opacity: 0;
            }

            /* Animation de survol */
            .btn {
                animation: buttonPulse 2s infinite;
            }

            @keyframes buttonPulse {
                0% {
                    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
                }
                70% {
                    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
                }
            }

            .search-users-btn, .chat-btn, .settings-btn {
                font-family: 'Segoe UI', 'Roboto', sans-serif;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
            }

            .search-users-btn:hover, .chat-btn:hover, .settings-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(255,215,0,0.2);
                background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,255,255,0.1));
            }
            @media (max-width: 768px) {
 .friend-request {
    flex-wrap: wrap;
 }
}
        

        `;
        this.shadowRoot.appendChild(style);
        
        this.updateContent();
        
        // Ajouter cette ligne après la mise à jour du contenu

        this.setupButtons();
        this.addEventListeners();

        // Ajouter la propriété currentUser
        this.currentUser = null;
        
        // Charger le nom d'utilisateur actuel
        this.loadCurrentUser();

        // Ajouter un écouteur pour les mises à jour d'amis
        window.addEventListener('friendRequestAccepted', async () => {
            await this.fetchFriendData();
        });

        // Ajouter un écouteur pour les changements de statut d'amitié
        window.addEventListener('friendshipStatusChanged', async () => {
            await this.fetchFriendData();
        });

        // Ajouter un intervalle pour vérifier les mises à jour de la liste d'amis
        this.friendsCheckInterval = setInterval(async () => {
            // Vérifier si l'utilisateur est toujours connecté
            if (localStorage.getItem("loggedIn") !== "true") {
                // Si déconnecté, arrêter l'intervalle
                clearInterval(this.friendsCheckInterval);
                return;
            }
            
            if (this.currentUser) {
                await this.fetchFriendData();
            }
        }, 3000);
    }

    async loadCurrentUser() {
        // Vérifier si l'utilisateur est connecté avant de faire l'appel API
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        try {
            const response = await fetch('/player_management/get_user_data/', {
                credentials: 'include'
            });
            const data = await response.json();
            this.currentUser = data.username;
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    }

    initTranslations() {
        this.translations = {
            'en': {
                // Profil principal
                'edit_profile': 'Edit Profile',
                'chat': 'Chat',
                'settings': 'Settings',
                'online': 'Online',
                'offline': 'Offline',
                'level': 'Level',
                'top_spin_clash': 'Top Spin Clash',
                
                // Statistiques
                'total_wins': 'Total Wins',
                'total_losses': 'Total Losses',
                'current_rank': 'Current Rank',
                'total_friends': 'Total Friends',
                'win_rate': 'Win Rate',
                'matches_played': 'Matches Played',
                
                // Sections
                'match_history': 'Match History',
                'friends': 'Friends',
                'friend_requests': 'Friend Requests',
                'no_matches': 'No matches played yet',
                'no_friends': 'No friends yet',
                'no_requests': 'No friend requests',
                
                // Match details
                'vs': 'VS',
                'score': 'Score',
                'win': 'Win',
                'loss': 'Loss',
                'draw': 'Draw',
                
                // Actions amis
                'add_friend': 'Add Friend',
                'unfriend': 'Unfriend',
                'block': 'Block',
                'unblock': 'Unblock',
                'accept': 'Accept',
                'decline': 'Decline',
                'cancel_request': 'Cancel Request',
                'search_friends': 'Search for players...',
                'wants_to_be_friends': 'wants to be your friend',
                
                // Modal
                'search_users': 'Search Users',
                'close': 'Close',
                'start_typing': 'Start typing to search...',
                
                // Messages
                'confirm_block_user': 'Are you sure you want to block {username}?',
                'user_blocked_success': 'User blocked successfully',
                'user_already_blocked': '{username} is already blocked',
                'error_blocking_user': 'Error blocking user',
                'friend_request_sent': 'Friend request sent',
                'friend_request_accepted': 'Friend request accepted',
                'friend_request_declined': 'Friend request declined',
                'unfriend_success': 'User unfriended successfully',
                
                // Rangs
                'unranked': 'Unranked',
                'bronze': 'Bronze',
                'silver': 'Silver',
                'gold': 'Gold',
                'platinum': 'Platinum',
                'diamond': 'Diamond'
            },
            'fr': {
                // Profil principal
                'edit_profile': 'Modifier le profil',
                'chat': 'Discussion',
                'settings': 'Paramètres',
                'online': 'En ligne',
                'offline': 'Hors ligne',
                'level': 'Niveau',
                'top_spin_clash': 'Top Spin Clash',
                
                // Statistiques
                'total_wins': 'Victoires totales',
                'total_losses': 'Défaites totales',
                'current_rank': 'Rang actuel',
                'total_friends': 'Amis totaux',
                'win_rate': 'Taux de victoire',
                'matches_played': 'Parties jouées',
                
                // Sections
                'match_history': 'Historique des matchs',
                'friends': 'Amis',
                'friend_requests': 'Demandes d\'ami',
                'no_matches': 'Aucun match joué',
                'no_friends': 'Aucun ami',
                'no_requests': 'Aucune demande d\'ami',
                
                // Match details
                'vs': 'CONTRE',
                'score': 'Score',
                'win': 'Victoire',
                'loss': 'Défaite',
                'draw': 'Égalité',
                
                // Actions amis
                'add_friend': 'Ajouter',
                'unfriend': 'Retirer',
                'block': 'Bloquer',
                'unblock': 'Débloquer',
                'accept': 'Accepter',
                'decline': 'Refuser',
                'cancel_request': 'Annuler',
                'search_friends': 'Rechercher des joueurs...',
                'wants_to_be_friends': 'veut être votre ami',
                
                // Modal
                'search_users': 'Rechercher',
                'close': 'Fermer',
                'start_typing': 'Commencez à taper pour rechercher...',
                
                // Messages
                'confirm_block_user': 'Voulez-vous vraiment bloquer {username} ?',
                'user_blocked_success': 'Utilisateur bloqué avec succès',
                'user_already_blocked': '{username} est déjà bloqué',
                'error_blocking_user': 'Erreur lors du blocage',
                'friend_request_sent': 'Demande d\'ami envoyée',
                'friend_request_accepted': 'Demande d\'ami acceptée',
                'friend_request_declined': 'Demande d\'ami refusée',
                'unfriend_success': 'Ami retiré avec succès',
                
                // Rangs
                'unranked': 'Non classé',
                'bronze': 'Bronze',
                'silver': 'Argent',
                'gold': 'Or',
                'platinum': 'Platine',
                'diamond': 'Diamant'
            },
            'es': {
                // Perfil principal
                'edit_profile': 'Editar perfil',
                'chat': 'Chat',
                'settings': 'Ajustes',
                'online': 'En línea',
                'offline': 'Desconectado',
                'level': 'Nivel',
                'top_spin_clash': 'Top Spin Clash',
                
                // Estadísticas
                'total_wins': 'Victorias totales',
                'total_losses': 'Derrotas totales',
                'current_rank': 'Rango actual',
                'total_friends': 'Amigos totales',
                'win_rate': 'Tasa de victoria',
                'matches_played': 'Partidas jugadas',
                
                // Secciones
                'match_history': 'Historial de partidas',
                'friends': 'Amigos',
                'friend_requests': 'Solicitudes de amistad',
                'no_matches': 'Sin partidas jugadas',
                'no_friends': 'Sin amigos',
                'no_requests': 'Sin solicitudes',
                
                // Detalles de partida
                'vs': 'VS',
                'score': 'Puntuación',
                'win': 'Victoria',
                'loss': 'Derrota',
                'draw': 'Empate',
                
                // Acciones de amigos
                'add_friend': 'Agregar amigo',
                'unfriend': 'Eliminar amigo',
                'block': 'Bloquear',
                'unblock': 'Desbloquear',
                'accept': 'Aceptar',
                'decline': 'Rechazar',
                'cancel_request': 'Cancelar solicitud',
                'search_friends': 'Buscar jugadores...',
                'wants_to_be_friends': 'quiere ser tu amigo',
                
                // Modal
                'search_users': 'Buscar usuarios',
                'close': 'Cerrar',
                'start_typing': 'Empieza a escribir para buscar...',
                
                // Mensajes
                'confirm_block_user': '¿Estás seguro de que quieres bloquear a {username}?',
                'user_blocked_success': 'Usuario bloqueado exitosamente',
                'user_already_blocked': '{username} ya está bloqueado',
                'error_blocking_user': 'Error al bloquear usuario',
                'friend_request_sent': 'Solicitud de amistad enviada',
                'friend_request_accepted': 'Solicitud de amistad aceptada',
                'friend_request_declined': 'Solicitud de amistad rechazada',
                'unfriend_success': 'Amigo eliminado exitosamente',
                
                // Rangos
                'unranked': 'Sin clasificar',
                'bronze': 'Bronce',
                'silver': 'Plata',
                'gold': 'Oro',
                'platinum': 'Platino',
                'diamond': 'Diamante'
            }
        };
    }

    // Méthode utilitaire pour obtenir une traduction
    getTranslation(key, replacements = {}) {
        const translation = this.translations[this.currentLang]?.[key];
        if (!translation) {
            return key;
        }

        // Remplacer les variables dans la traduction
        return Object.entries(replacements).reduce(
            (text, [key, value]) => text.replace(`{${key}}`, value),
            translation
        );
    }

    updateContent() {
        // Vérifier si l'utilisateur est connecté avant de faire les appels API
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        // Créer le contenu sans recréer le style
        this.shadowRoot.innerHTML = `
        <link rel="stylesheet" href="bootstrap.min.css">
            ${this.shadowRoot.querySelector('style').outerHTML}
           <div class="profile-container p-lg-4 p-3">
        <div class="profile-header row g-4">
            <div class="col-lg-2 col-md-2 col-sm-12">
                <div class="avatar-section">
                    <div class="avatar-wrapper">
                        <img src="" alt="Profile Avatar" class="profile-avatar">
                    </div>
                    <h1 class="profile-name"></h1>
                    <div class="status">${this.getTranslation('online')}</div>
                </div>
            </div>
    
            <div class="col-lg-8 col-md-8 col-sm-12">
                <div class="level-section">
                    <h2 class="level-title">${this.getTranslation('top_spin_clash')}</h2>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p class="progress-text">${this.getTranslation('level')} 0 - 00%</p>
                </div>
            </div>
            <div class="col-lg-2 col-md-12 col-sm-12">
                <div class="profile-actions">
                    <button class="quick-stat-item chat-btn">
                        ${this.getTranslation('chat')}
                        <i class="fas fa-comments"></i>
                    </button>
                    <button class="quick-stat-item settings-btn">
                        ${this.getTranslation('settings')}
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        </div>
    
        <div class="row g-4 stats-grid">
            <div class="col-lg-3 col-md-6 col-sm-12">
                <div class="stat-box">
                    <div class="total_wins">0</div>
                    <div class="stat-label">${this.getTranslation('total_wins')}</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12">
                <div class="stat-box">
                    <div class="total_losses">0</div>
                    <div class="stat-label">${this.getTranslation('total_losses')}</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12">
                <div class="stat-box">
                    <div class="stat-value">MVP</div>
                    <div class="stat-label">${this.getTranslation('current_rank')}</div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12">
                <div class="stat-box">
                    <div class="stat-value">0</div>
                    <div class="stat-label">${this.getTranslation('friends')}</div>
                </div>
            </div>
        </div>
    
        <div class="row g-4">
            <div class="col-lg-4 col-md-6 col-sm-12 section">
                <h2 class="section-title">${this.getTranslation('match_history')}</h2>
                <div class="match-item">
                    <img src="" alt="Opponent" class="player-avatar" id="match-avatar">
                    <div class="match-details">
                        <div class="match-line">
                            <div class="vs-text">${this.getTranslation('vs')}</div>
                            <div class="vs-opponent"></div>
                        </div>
                        <div class="match-line">
                            <div class="score-label">${this.getTranslation('score')}:</div>
                            <div class="score"></div>
                        </div>
                    </div>
                    <span class="result-badge loss">${this.getTranslation('loss')}</span>
                </div>
            </div>
    
            <div class="col-lg-4 col-md-6 col-sm-12 section">
                <h2 class="section-title">${this.getTranslation('friends')}</h2>
                <div class="friend-item">
                    <img src="icon/woman.png" alt="Friend" class="player-avatar">
                    <div class="friend-details">
                        <div class="vs-opponent">Sova</div>
                        <div>Online</div>
                    </div>
                </div>
                <div class="friend-item">
                    <img src="icon/man 1.png" alt="Friend" class="player-avatar">
                    <div class="friend-details">
                        <div class="vs-text">Phoenix</div>
                        <div>Offline</div>
                    </div>
                </div>
            </div>
    
            <div class="col-lg-4 col-md-6 col-sm-12 section">
                <h2 class="section-title">${this.getTranslation('friend_requests')}</h2>
                <div class="friend-request">
                    <img src="icon/user.png" alt="Jett" class="request-avatar">
                    <div class="request-info">
                        <div class="request-name">Jett</div>
                        <div class="request-status">${this.getTranslation('wants_to_be_friends')}</div>
                    </div>
                    <div class="request-buttons">
                        <button class="btn accept">${this.getTranslation('accept')}</button>
                        <button class="btn decline">${this.getTranslation('decline')}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `;
        
        this.initializeAnimations();
        this.fetchUserData();
        this.fetchMatchData();
        this.fetchFriendData();

        // Nettoyer l'ancien intervalle s'il existe
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        // Faire une première vérification du statut
        const username = this.shadowRoot.querySelector('.profile-name')?.textContent;
        if (username) {
            // Vérifier d'abord si l'endpoint fonctionne
            this.updateUserStatus(username).then(success => {
                if (success) {
                    // Ne démarrer l'intervalle que si la première requête réussit
                    this.statusInterval = setInterval(() => {
                        const currentUsername = this.shadowRoot.querySelector('.profile-name')?.textContent;
                        if (currentUsername) {
                            this.updateUserStatus(currentUsername);
                        } else {
                            clearInterval(this.statusInterval);
                            this.statusInterval = null;
                        }
                    }, 30000);
                }
            });
        }
    }
    
    async fetchMatchData() {
        try {
            const response = await fetch("/player_management/get_match_data/", {
                method: "GET",
                credentials: "include"
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const matchHistory = await response.json();
            const matchHistorySection = this.shadowRoot.querySelector('.section:nth-child(1)');
    
            // Mettre à jour le level et la progression
            if (matchHistory && matchHistory.length > 0) {
                const currentLevel = matchHistory[0].level;
                const progressText = this.shadowRoot.querySelector('.progress-text');
                const progressFill = this.shadowRoot.querySelector('.progress-fill');
                const levelTitle = this.shadowRoot.querySelector('.level-title');

                // Formater le niveau et la progression
                const level = Math.floor(currentLevel);
                const progress = Math.round((currentLevel % 1) * 100);
                
                // Ajouter les zéros devant si nécessaire
                const formattedLevel = String(level).padStart(2, '0');
                const formattedProgress = String(progress).padStart(2, '0');
                
                // Créer le texte formaté
                const formattedText = `${formattedLevel} - ${formattedProgress}%`;

                // Convertir le pourcentage pour la barre de progression
                const fillPercentage = (currentLevel * 10);

                // Mettre à jour le texte du niveau
                if (progressText) {
                    progressText.textContent = `${this.getTranslation('level')} ${formattedText}`;
                }

                // Mettre à jour le titre avec le niveau
                if (levelTitle) {
                    levelTitle.textContent = `${this.getTranslation('level')} ${formattedText}`;
                }

                // Mettre à jour la barre de progression
                if (progressFill) {
                    progressFill.style.width = '0%';
                    setTimeout(() => {
                        progressFill.style.width = `${fillPercentage}%`;
                    }, 100);

                    // Définir les couleurs pour différentes étapes de progression
                    let gradientColor;
                    if (currentLevel <= 2) {
                        gradientColor = 'linear-gradient(90deg, #CD7F32, #8B4513)';  // Bronze
                    } else if (currentLevel <= 4) {
                        gradientColor = 'linear-gradient(90deg, #C0C0C0, #808080)';  // Argent
                    } else if (currentLevel <= 6) {
                        gradientColor = 'linear-gradient(90deg, #FFD700, #FFA500)';  // Or
                    } else if (currentLevel <= 8) {
                        gradientColor = 'linear-gradient(90deg, #E5E4E2, #B9F2FF)';  // Platine
                    } else {
                        gradientColor = 'linear-gradient(90deg, #B9F2FF, #4169E1)';  // Diamant
                    }

                    progressFill.style.background = gradientColor;
                }
            }
    
            // Mettre à jour le rang
            if (matchHistory && matchHistory.length > 0) {
                const currentRank = matchHistory[0].rank; // Prendre le rang du dernier match
                const rankElement = this.shadowRoot.querySelector('.stat-box:nth-child(3) .stat-value');
                
                if (rankElement) {
                    rankElement.textContent = currentRank;
                    
                    // Ajouter une classe pour le style selon le rang
                    rankElement.className = 'stat-value'; // Reset des classes
                    rankElement.classList.add(currentRank.toLowerCase());
                    
                    // Ajouter des styles spécifiques pour chaque rang
                    const rankStyles = {
                        'bronze': '#CD7F32',
                        'silver': '#C0C0C0',
                        'gold': '#FFD700',
                        'platinum': '#E5E4E2',
                        'diamond': '#B9F2FF'
                    };
                    
                    rankElement.style.color = rankStyles[currentRank.toLowerCase()] || '#FFD700';
                    rankElement.style.textShadow = `0 0 10px ${rankStyles[currentRank.toLowerCase()] || '#FFD700'}40`;
                }
            }
    
            // Si pas de matches
            if (!matchHistory || matchHistory.length === 0) {
                matchHistorySection.innerHTML = `
                    <h2 class="section-title">${this.getTranslation('match_history')}</h2>
                    <div class="no-matches">
                        ${this.getTranslation('no_matches') || 'Aucun match dans l\'historique'}
                    </div>
                `;
                return;
            }
    
            // Générer l'historique des matches
            matchHistorySection.innerHTML = `
                <h2 class="section-title">${this.getTranslation('match_history')}</h2>
                ${matchHistory.map(match => `
                    <div class="match-item">
                        <img src="" alt="Opponent" class="player-avatar" id="match-avatar">
                        <div class="match-details">
                            <div class="match-line">
                                <div class="vs-text">${this.getTranslation('vs')}</div>
                                <div class="vs-opponent">${match.winner === match.super_user ? match.loser : match.winner}</div>
                            </div>
                            <div class="match-line">
                                <div class="score-label">${this.getTranslation('score')}:</div>
                                <div class="score">${match.score}</div>
                            </div>
                        </div>
                        <span class="result-badge ${match.winner !== match.super_user ? 'win' : 'loss'}">
                            ${match.winner !== match.super_user ? this.getTranslation('win') : this.getTranslation('loss')}
                        </span>
                    </div>
                `).join('')}
            `;
    
            // Mettre à jour les statistiques
            const total_wins = this.shadowRoot.querySelector(".total_wins");
            const total_losses = this.shadowRoot.querySelector(".total_losses");
    
            if (matchHistory.length > 0) {
                if (total_wins) {
                    total_wins.textContent = matchHistory[0].wins || '0';
                }
                if (total_losses) {
                    total_losses.textContent = matchHistory[0].losses || '0';
                }
            }
    
        } catch (error) {
            console.error("Error fetching match data:", error);
            const matchHistorySection = this.shadowRoot.querySelector('.section:nth-child(1)');
            if (matchHistorySection) {
                matchHistorySection.innerHTML = `
                    <h2 class="section-title">${this.getTranslation('match_history')}</h2>
                    <div class="error-message">
                        ${this.getTranslation('error_loading_matches') || 'Erreur lors du chargement des matchs'}
                    </div>
                `;
            }
        }
    }

    async fetchFriendData() {
        // Vérifier si l'utilisateur est toujours connecté
        if (localStorage.getItem("loggedIn") !== "true") {
            return;
        }

        try {
            const [friendsResponse, invitesResponse] = await Promise.all([
                fetch("/player_management/player_friendship_get/?target=friends", {
                    credentials: "include"
                }),
                fetch("/player_management/player_friendship_get/?target=invites", {
                    method: "GET",
                    credentials: "include",
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            const friendsData = await friendsResponse.json();
            const invitesData = await invitesResponse.json();

            
            // Nouveau sélecteur qui devrait fonctionner
            const friendCountElement = this.shadowRoot.querySelector('.stats-grid .col-lg-3:nth-child(4) .stat-value');

            // Mettre à jour le nombre d'amis seulement si changé
            if (friendCountElement && friendsData.friendships) {
                const newCount = friendsData.friendships.length;
                const currentCount = parseInt(friendCountElement.textContent);
                if (currentCount !== newCount) {
                    friendCountElement.textContent = newCount;
                }
            }

            // Mettre à jour la liste des amis seulement si changée
            const friendsSection = this.shadowRoot.querySelector('.section:nth-child(2)');
            if (friendsSection && friendsData.friendships) {
                const currentFriendsList = Array.from(friendsSection.querySelectorAll('.friend-item'))
                    .map(item => item.dataset.username);
                const newFriendsList = friendsData.friendships.map(friend => friend.username);

                // Vérifier si la liste a changé
                const hasChanged = JSON.stringify(currentFriendsList.sort()) !== JSON.stringify(newFriendsList.sort());

                if (hasChanged) {
                    if (friendsData.friendships.length === 0) {
                        friendsSection.innerHTML = `
                            <h2 class="section-title">${this.getTranslation('friends')}</h2>
                            <div class="no-friends">${this.getTranslation('no_friends')}</div>
                        `;
                    } else {
                        friendsSection.innerHTML = `
                            <h2 class="section-title">${this.getTranslation('friends')}</h2>
                            ${friendsData.friendships.map(friend => `
                                <div class="friend-item" data-username="${friend.username}">
                                    <img src="${friend.avatar || 'icon/user.png'}" alt="${friend.username}" class="player-avatar">
                                    <div class="friend-details">
                                        <div class="vs-opponent">${friend.username}</div>
                                        <div>${friend.status || 'Offline'}</div>
                                    </div>
                                    <button class="block-button" data-username="${friend.username}">
                                        <i class="fas fa-ban"></i> ${this.getTranslation('block')}
                                    </button>
                                </div>
                            `).join('')}
                        `;

                        // Réattacher les écouteurs d'événements
                        const blockButtons = friendsSection.querySelectorAll('.block-button');
                        blockButtons.forEach(button => {
                            button.addEventListener('click', (e) => {
                                e.stopPropagation();
                                this.handleBlockUser(button.dataset.username);
                            });
                        });
                    }
                }
            }

            // Même logique pour les demandes d'amis
            const requestsSection = this.shadowRoot.querySelector('.section:nth-child(3)');
            if (requestsSection && invitesData.friendships) {
                const currentRequests = Array.from(requestsSection.querySelectorAll('.friend-request'))
                    .map(item => item.dataset.username);
                const newRequests = invitesData.friendships.map(request => request.username);

                const hasChanged = JSON.stringify(currentRequests.sort()) !== JSON.stringify(newRequests.sort());

                if (hasChanged) {
                    if (invitesData.friendships.length === 0) {
                        requestsSection.innerHTML = `
                            <h2 class="section-title">${this.getTranslation('friend_requests')}</h2>
                            <div class="no-requests">${this.getTranslation('no_requests')}</div>
                        `;
                    } else {
                        requestsSection.innerHTML = `
                            <h2 class="section-title">${this.getTranslation('friend_requests')}</h2>
                            ${invitesData.friendships.map(request => `
                                <div class="friend-request" data-username="${request.username}">
                                    <img src="${request.avatar || 'icon/user.png'}" alt="${request.username}" class="request-avatar">
                                    <div class="request-info">
                                        <div class="request-name">${request.username}</div>
                                        <div class="request-status">${this.getTranslation('wants_to_be_friends')}</div>
                                    </div>
                                    <div class="request-buttons">
                                        <button class="btn accept" data-username="${request.username}">${this.getTranslation('accept')}</button>
                                        <button class="btn decline" data-username="${request.username}">${this.getTranslation('decline')}</button>
                                    </div>
                                </div>
                            `).join('')}
                        `;

                        // Réattacher les écouteurs d'événements
                        const acceptButtons = requestsSection.querySelectorAll('.btn.accept');
                        const declineButtons = requestsSection.querySelectorAll('.btn.decline');

                        acceptButtons.forEach(button => {
                            button.addEventListener('click', () => this.handleFriendRequest(button.dataset.username, 'accept'));
                        });

                        declineButtons.forEach(button => {
                            button.addEventListener('click', () => this.handleFriendRequest(button.dataset.username, 'decline'));
                        });
                    }
                }
            }

        } catch (error) {
            console.error("Error fetching friend data:", error);
        }
    }

    async handleFriendRequest(username, action) {
        try {
            const response = await fetch('/player_management/handle_friend_request/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken'),
                },
                body: JSON.stringify({
                    username: username,
                    action: action
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Network response was not ok');
            }

            // Rafraîchir les données après l'action
            await this.fetchFriendData();

            // Émettre l'événement pour informer les autres composants
            window.dispatchEvent(new CustomEvent('friendRequestAccepted'));
            window.dispatchEvent(new CustomEvent('friendshipStatusChanged'));

        } catch (error) {
            console.error('Error handling friend request:', error);
            alert(error.message);
        }
    }

    async fetchUserData() {
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
                // Mise à jour des éléments dans le profil
                const profileName = this.shadowRoot.querySelector(".profile-name");
                const profileAvatar = this.shadowRoot.querySelector(".profile-avatar");
                const matchAvatar = this.shadowRoot.querySelector("#match-avatar");

                if (profileName) {
                    profileName.textContent = data.username;
                }

                if (profileAvatar) {
                    profileAvatar.src = data.avatar;
                }

                // Mettre à jour l'avatar du match history
                if (matchAvatar) {
                    matchAvatar.src = data.avatar;
                }
            })
            .catch(error => console.error("Error fetching user data:", error));
    }
    initializeAnimations() {
        requestAnimationFrame(() => {
            const progressFill = this.shadowRoot.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = '75%';
            }
        });
    }

    addEventListeners() {
        setTimeout(() => {
        }, 100);
    }

    openModal() {
        const modal = this.shadowRoot.querySelector('.friends-modal');
        modal.style.display = 'flex';
        this.isModalOpen = true;
    }

    closeModal() {
        const modal = this.shadowRoot.querySelector('.friends-modal');
        modal.style.display = 'none';
        this.isModalOpen = false;
    }

    async searchFriends(query) {
        try {
            const response = await fetch(`/player_management/search_usernames/?username=${query}`, {
                credentials: 'include'
            });

            const data = await response.json();
            const friendsList = this.shadowRoot.querySelector('.friends-list');
            
            if (!friendsList) return;

            if (data.message) {
                friendsList.innerHTML = `<div class="info">${data.message}</div>`;
                return;
            }

            friendsList.innerHTML = data.map(user => `
                <div class="friend-item">
                    <div class="friend-info" data-username="${user.username}" style="cursor: pointer;">
                        <img src="${user.avatar || 'default-avatar.png'}" alt="${user.username}">
                        <span>${user.username}</span>
                    </div>
                    <button class="send-request-btn" data-username="${user.username}">
                        ${this.getTranslation('add_friend')}
                    </button>
                </div>
            `).join('');

            // Ajouter les event listeners pour la navigation vers le profil
            const friendInfos = friendsList.querySelectorAll('.friend-info');
            friendInfos.forEach(info => {
                info.addEventListener('click', () => {
                    const username = info.dataset.username;
                    this.closeModal(); // Fermer le modal

                    // Utiliser le routeur pour la navigation
                    if (window.router) {
                        window.router.navigate(`/profile?username=${username}`);
                    } else {
                        // Fallback si le routeur n'est pas disponible
                        window.location.href = `/profile?username=${username}`;
                    }
                });
            });

            // Ajouter les event listeners pour les boutons d'envoi de demande d'ami
            const sendButtons = friendsList.querySelectorAll('.send-request-btn');
            sendButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Empêcher la navigation lors du clic sur le bouton
                    const username = e.target.dataset.username;
                    this.sendFriendRequest(username);
                });
            });

        } catch (error) {
            console.error('Error searching friends:', error);
            const friendsList = this.shadowRoot.querySelector('.friends-list');
            if (friendsList) {
                friendsList.innerHTML = `<div class="error">${this.getTranslation('search_error')}</div>`;
            }
        }
    }

    async sendFriendRequest(username) {
        try {
            const response = await fetch('/player_management/AddFriend/', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                },
                body: JSON.stringify({
                    target_username: username
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Afficher un message de succès
                this.showNotification(this.getTranslation('friend_request_sent'), 'success');
                
                // Mettre à jour l'interface
                const addFriendBtn = this.shadowRoot.querySelector('.add-friend-btn');
                if (addFriendBtn) {
                    addFriendBtn.textContent = this.getTranslation('request_sent');
                    addFriendBtn.disabled = true;
                    addFriendBtn.classList.add('pending');
                }

                // Recharger le profil pour mettre à jour l'affichage
                await this.loadProfile(username);
            } else {
                // Gérer les différents cas d'erreur
                let errorMessage = data.message || this.getTranslation('error_sending_request');
                
                if (data.error === "Friend request already sent") {
                    errorMessage = this.getTranslation('request_already_sent');
                } else if (data.error === "Already friends") {
                    errorMessage = this.getTranslation('already_friends');
                }
                
                this.showNotification(errorMessage, 'error');
            }

        } catch (error) {
            console.error('Error sending friend request:', error);
            this.showNotification(this.getTranslation('error_sending_request'), 'error');
        }
    }

    // Ajouter cette méthode pour récupérer le token CSRF
    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    updateAvatar(newAvatarUrl) {
        const avatars = this.shadowRoot.querySelectorAll('img');
        avatars.forEach(avatar => {
            if (avatar.src.includes('cdn.intra.42.fr')) {
                avatar.src = newAvatarUrl;
            }
        });
    }

    async handleBlockUser(username) {
        try {
            console.group('🔍 DEBUG: Blocage Utilisateur');
            const confirmMessage = this.getTranslation('confirm_block_user', { username: username || '' });
            if (!confirm(confirmMessage)) {
                console.groupEnd();
                return;
            }

            const response = await fetch('/player_management/blockfriend/', {
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
                if (data.error_code === 'ALREADY_BLOCKED') {
                    this.showNotification(this.getTranslation('user_already_blocked', { username }), 'warning');
                    return;
                }
                throw new Error(data.message || 'Network response was not ok');
            }

            // Supprimer l'ami de la liste des amis
            const friendElement = this.shadowRoot.querySelector(`.friend-item[data-username="${username}"]`);
            if (friendElement) {
                friendElement.remove();
            }

            // Mettre à jour le compteur d'amis
            const friendCounter = this.shadowRoot.querySelector('.stat-box:nth-child(4) .stat-value');
            if (friendCounter) {
                const currentCount = parseInt(friendCounter.textContent) || 0;
                friendCounter.textContent = Math.max(0, currentCount - 1);
            }

            // Rafraîchir la liste des amis
            await this.fetchFriendData();  // Ajout de await ici
            
            // Afficher une notification de succès
            this.showNotification(this.getTranslation('user_blocked_success'), 'success');

            // Émettre l'événement userBlocked
            const event = new CustomEvent('userBlocked', {
                detail: {
                    username: username,
                    avatar: this.shadowRoot.querySelector(`img[alt="${username}"]`)?.src || 'icon/user.png'
                }
            });
            window.dispatchEvent(event);

        } catch (error) {
            console.error('❌ ERREUR BLOCAGE:', {
                message: error.message,
                stack: error.stack,
                username: username
            });
            this.showNotification(this.getTranslation('error_blocking_user'), 'error');
        } finally {
            console.groupEnd();
        }
    }

    showNotification(message, type = 'info') {
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

        // Supprimer la notification après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async loadProfile(username = null) {
        try {
            // Attendre que currentUser soit nchargé s'il ne l'est pas déjà
            if (!this.currentUser) {
                await this.loadCurrentUser();
            }
            // const url = new URL('/player_management/profile/');
            const url = new URL('/player_management/profile/', window.location.origin);

            if (username) {
                url.searchParams.set('username', username);
            }

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.groupEnd();

            // Vérifier si c'est un profil externe
            const isExternalProfile = username && username !== this.currentUser;

            // Mettre à jour l'interface utilisateur
            this.updateProfileUI(data, isExternalProfile);

            console.groupEnd();
        } catch (error) {
            console.error('❌ Profile loading error:', error);
        }
    }

    updateProfileUI(data, isExternalProfile) {
        const { profile, match_history, friendship_status } = data;

        // Mettre à jour les informations du profil
        const profileName = this.shadowRoot.querySelector('.profile-name');
        const profileAvatar = this.shadowRoot.querySelector('.profile-avatar');
        const statusElement = this.shadowRoot.querySelector('.status');
        
        if (profileName) profileName.textContent = profile.username;
        if (profileAvatar) profileAvatar.src = profile.avatar || 'icon/default-avatar.png';
        
        // Mettre à jour le statut
        if (statusElement) {
            // Log pour déboguer le statut
            const status = profile.status?.toUpperCase() || 'OFF';
            const isOnline = status === 'ONL';
            
            statusElement.textContent = this.getTranslation(isOnline ? 'online' : 'offline');
            statusElement.className = `status ${isOnline ? 'online' : 'offline'}`;
            
            // Ajouter une couleur de fond différente selon le statut
            statusElement.style.backgroundColor = isOnline ? '#2ecc71' : '#e74c3c';
        }

        // Mettre à jour les statistiques
        const winsElement = this.shadowRoot.querySelector('.total_wins');
        const lossesElement = this.shadowRoot.querySelector('.total_losses');
        // Nouveau sélecteur pour le rang
        const rankElement = this.shadowRoot.querySelector('.stats-grid .col-lg-3:nth-child(3) .stat-value');
        // Nouveau sélecteur pour les amis
        const friendsElement = this.shadowRoot.querySelector('.stats-grid .col-lg-3:nth-child(4) .stat-value');

        if (winsElement) winsElement.textContent = profile.wins || '0';
        if (lossesElement) lossesElement.textContent = profile.losses || '0';
        if (rankElement) rankElement.textContent = profile.rank || 'Unranked';  // Afficher le rang
        if (friendsElement) friendsElement.textContent = profile.friends || '0';

        // Ajouter une classe de couleur au rang
        if (rankElement) {
            // Supprimer les anciennes classes de rang
            rankElement.classList.remove('rank-bronze', 'rank-silver', 'rank-gold', 'rank-platinum', 'rank-diamond', 'rank-default');
            // Ajouter la nouvelle classe
            rankElement.classList.add(`rank-${(profile.rank || 'default').toLowerCase()}`);
        }

        // Mettre à jour le niveau et la progression
        const progressText = this.shadowRoot.querySelector('.progress-text');
        const progressFill = this.shadowRoot.querySelector('.progress-fill');
        const levelTitle = this.shadowRoot.querySelector('.level-title');

        if (profile.level !== undefined) {
            const level = profile.level;
            const formattedLevel = String(Math.floor(level)).padStart(2, '0');
            const progress = Math.round((level % 1) * 100);

            if (progressText) {
                progressText.textContent = `${this.getTranslation('level')} ${formattedLevel} - ${progress}%`;
            }

            if (levelTitle) {
                const rankClass = profile.rank?.toLowerCase() || 'default';
                levelTitle.className = `level-title rank-${rankClass}`;
                levelTitle.textContent = profile.rank || this.getTranslation('unranked');
                
            }

            if (progressFill) {
                progressFill.style.width = `${progress}%`;
                
                // Définir la couleur selon le rang
                let gradientColor;
                switch (profile.rank?.toLowerCase()) {
                    case 'bronze':
                        gradientColor = 'linear-gradient(90deg, #CD7F32, #8B4513)';
                        break;
                    case 'silver':
                        gradientColor = 'linear-gradient(90deg, #C0C0C0, #808080)';
                        break;
                    case 'gold':
                        gradientColor = 'linear-gradient(90deg, #FFD700, #FFA500)';
                        break;
                    case 'platinum':
                        gradientColor = 'linear-gradient(90deg, #E5E4E2, #B9F2FF)';
                        break;
                    case 'diamond':
                        gradientColor = 'linear-gradient(90deg, #B9F2FF, #4169E1)';
                        break;
                    default:
                        gradientColor = 'linear-gradient(90deg, #808080, #404040)';
                }
                progressFill.style.background = gradientColor;
            }
        }

        // Mettre à jour l'historique des matchs
        if (isExternalProfile) {
            this.updateMatchHistory(match_history);
        } else {
            // Toujours mettre à jour l'historique pour son propre profil, 
            // même si match_history est vide
            this.updateMatchHistory(match_history);
        }

        // Mettre à jour les actions selon le type de profil
        const actionsContainer = this.shadowRoot.querySelector('.profile-actions');
        if (actionsContainer) {
            if (!isExternalProfile) {
                actionsContainer.innerHTML = `
                    <button class="quick-stat-item chat-btn">
                        ${this.getTranslation('chat')}
                        <i class="fas fa-comments"></i>
                    </button>
                    <button class="quick-stat-item settings-btn">
                        ${this.getTranslation('settings')}
                        <i class="fas fa-cog"></i>
                    </button>
                `;
                // Ajouter cette ligne après la mise à jour des boutons
                this.setupButtons();
            } else {
                this.showExternalProfileActions(friendship_status);
            }
        }

        // Gérer l'affichage des sections selon le type de profil
        const friendsSection = this.shadowRoot.querySelector('.section:nth-child(2)');  // Section Friends
        const requestsSection = this.shadowRoot.querySelector('.section:nth-child(3)'); // Section Friend Requests

        if (isExternalProfile) {
            // Cacher les sections pour un profil externe
            if (friendsSection) friendsSection.style.display = 'none';
            if (requestsSection) requestsSection.style.display = 'none';
        } else {
            // Afficher les sections pour son propre profil
            if (friendsSection) friendsSection.style.display = 'block';
            if (requestsSection) requestsSection.style.display = 'block';
        }

        console.groupEnd();
    }

    setupProfileButtons() {
        // Event listener pour le bouton d'édition
        const editBtn = this.shadowRoot.querySelector('.edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                history.pushState({}, "", '/settings');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }

        // Event listener pour le bouton de recherche d'utilisateurs
        const searchUsersBtn = this.shadowRoot.querySelector('.search-users-btn');
        if (searchUsersBtn) {
            searchUsersBtn.addEventListener('click', () => this.openModal());
        }

        // Event listeners pour le modal
        const modal = this.shadowRoot.querySelector('.friends-modal');
        const closeButton = this.shadowRoot.querySelector('.close-modal');
        const searchInput = this.shadowRoot.querySelector('.friend-search');

        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const searchValue = e.target.value.trim();
                
                if (!searchValue) {
                    const friendsList = this.shadowRoot.querySelector('.friends-list');
                    if (friendsList) {
                        friendsList.innerHTML = '<div class="info">Start typing to search...</div>';
                    }
                    return;
                }

                searchTimeout = setTimeout(() => {
                    this.searchFriends(searchValue);
                }, 300);
            });
        }

        // Event listener pour le bouton chat
        const chatBtn = this.shadowRoot.querySelector('.chat-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                history.pushState({}, "", '/chat');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }

        // Event listener pour le bouton settings
        const settingsBtn = this.shadowRoot.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                history.pushState({}, "", '/settings');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }
    }

    showExternalProfileActions(friendshipStatus) {
        const actionsContainer = this.shadowRoot.querySelector('.profile-actions');
        if (!actionsContainer) return;

        let actionButtons = '';
        switch (friendshipStatus) {
            case 'ACC':
                actionButtons = `
                    <button class="btn unfriend-btn">${this.getTranslation('unfriend')}</button>
                    <button class="btn block-btn">${this.getTranslation('block')}</button>
                `;
                break;
            case 'PEN_RECEIVED':  // Nouveau cas : demande reçue
                actionButtons = `
                    <button class="btn accept-btn">${this.getTranslation('accept')}</button>
                    <button class="btn decline-btn">${this.getTranslation('decline')}</button>
                    <button class="btn block-btn">${this.getTranslation('block')}</button>
                `;
                break;
            case 'PEN':  // PEN devient le cas pour demande envoyée
                actionButtons = `
                    <button class="btn cancel-request-btn">${this.getTranslation('cancel_request')}</button>
                    <button class="btn block-btn">${this.getTranslation('block')}</button>
                `;
                break;
            case 'BLK':
                actionButtons = `
                    <button class="btn unblock-btn">${this.getTranslation('unblock')}</button>
                `;
                break;
            default:
                actionButtons = `
                    <button class="btn add-friend-btn">${this.getTranslation('add_friend')}</button>
                    <button class="btn block-btn">${this.getTranslation('block')}</button>
                `;
                break;
        }

        actionsContainer.innerHTML = actionButtons;
        this.setupActionButtons();
    }

    setupActionButtons() {
        const profileUsername = this.shadowRoot.querySelector('.profile-name').textContent;
        if (!profileUsername) return;

        // Obtenir le token CSRF
        const csrftoken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        const headers = {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        };

        // Add Friend Button
        const addFriendBtn = this.shadowRoot.querySelector('.add-friend-btn');
        if (addFriendBtn) {
            addFriendBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/AddFriend/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ 
                            target_username: profileUsername  // Changé de 'username' à 'target_username'
                        })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions('PEN');
                    } else {
                        const data = await response.json();
                        console.error('Error response:', data);
                    }
                } catch (error) {
                    console.error('Error sending friend request:', error);
                }
            });
        }

        // Cancel Request Button
        const cancelRequestBtn = this.shadowRoot.querySelector('.cancel-request-btn');
        if (cancelRequestBtn) {
            cancelRequestBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/deleteplayerfriendship/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ username: profileUsername })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions(null);
                    }
                } catch (error) {
                    console.error('Error canceling friend request:', error);
                }
            });
        }

        // Unfriend Button
        const unfriendBtn = this.shadowRoot.querySelector('.unfriend-btn');
        if (unfriendBtn) {
            unfriendBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/deleteplayerfriendship/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': csrftoken
                        },
                        credentials: 'include',
                        body: JSON.stringify({ 
                            username: profileUsername,
                            action: 'unfriend'  // Ajout d'une action explicite
                        })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions(null);
                        await this.fetchFriendData();  // Ajout de cette ligne
                        console.warn("current user:", this.currentUser)
                        await this.loadProfile(this.currentUser);
                    } else {
                        const data = await response.json();
                        console.error('Error response:', data);
                    }
                } catch (error) {
                    console.error('Error unfriending:', error);
                }
            });
        }

        // Block Button
        const blockBtn = this.shadowRoot.querySelector('.block-btn');
        if (blockBtn) {
            blockBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/blockfriend/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ username: profileUsername })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions('BLK');
                    }
                } catch (error) {
                    console.error('Error blocking user:', error);
                }
            });
        }

        // Unblock Button
        const unblockBtn = this.shadowRoot.querySelector('.unblock-btn');
        if (unblockBtn) {
            unblockBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/unblockfriend/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ username: profileUsername })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions(null);
                    }
                } catch (error) {
                    console.error('Error unblocking user:', error);
                }
            });
        }

        // Accept Button
        const acceptBtn = this.shadowRoot.querySelector('.accept-btn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', async () => {
                try {
                    // Corriger l'URL qui commence par '0/'
                    const response = await fetch('/player_management/handle_friend_request/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ 
                            username: profileUsername,
                            action: 'accept'
                        })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions('ACC');
                    } else {
                        const data = await response.json();
                        console.error('Error response:', data);
                    }
                } catch (error) {
                    console.error('Error accepting friend request:', error);
                }
            });
        }

        // Decline Button
        const declineBtn = this.shadowRoot.querySelector('.decline-btn');
        if (declineBtn) {
            declineBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/player_management/handle_friend_request/', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include',
                        body: JSON.stringify({ 
                            username: profileUsername,
                            action: 'decline'
                        })
                    });

                    if (response.ok) {
                        this.showExternalProfileActions(null);
                    } else {
                        const data = await response.json();
                        console.error('Error response:', data);
                    }
                } catch (error) {
                    console.error('Error declining friend request:', error);
                }
            });
        }
    }

    async updateMatchHistory(matchHistory) {
        const matchHistorySection = this.shadowRoot.querySelector('.section:nth-child(1)');
        if (!matchHistorySection) return;

        // Vérifier si l'historique est vide ou non défini
        if (!matchHistory || matchHistory.length === 0) {
            matchHistorySection.innerHTML = `
                <h2 class="section-title">${this.getTranslation('match_history')}</h2>
                <div class="section-content">
                    <div class="no-matches">${this.getTranslation('no_matches')}</div>
                </div>
            `;
            return;
        }

        // Récupérer l'avatar du profil actuel
        const profileAvatar = this.shadowRoot.querySelector('.profile-avatar')?.src || 'icon/user.png';
        
        // Récupérer le nom d'utilisateur du profil qu'on regarde
        // Utiliser le username des paramètres d'URL si on visite un profil
        const urlParams = new URLSearchParams(window.location.search);
        const visitedUsername = urlParams.get('username');
        const profileUsername = visitedUsername || this.currentUser;

        matchHistorySection.innerHTML = `
            <h2 class="section-title">${this.getTranslation('match_history')}</h2>
            <div class="section-content">
                ${matchHistory.map(match => {
                    // Déterminer si le propriétaire du profil est le gagnant
                    const isWinner = match.winner.trim() === profileUsername?.trim();
                    
                    // Obtenir toujours le nom de l'adversaire
                    const adversaryName = isWinner ? 
                        match.loser.trim() :    // Si le propriétaire du profil est le gagnant, l'adversaire est le perdant
                        match.winner.trim();    // Si le propriétaire du profil est le perdant, l'adversaire est le gagnant
                    
                    return `
                        <div class="match-item">
                            <img src="${profileAvatar}" alt="${profileUsername}" class="player-avatar">
                            <div class="match-details">
                                <div class="match-line">
                                    <div class="vs-text">${this.getTranslation('vs')}</div>
                                    <div class="vs-opponent">${adversaryName}</div>
                                </div>
                                <div class="match-line">
                                    <div class="score-label">${this.getTranslation('score')}:</div>
                                    <div class="score">${match.score}</div>
                                </div>
                            </div>
                            <span class="result-badge ${isWinner ? 'win' : 'loss'}">
                                ${isWinner ? this.getTranslation('win') : this.getTranslation('loss')}
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    connectedCallback() {
    }

    async updateUserStatus(username) {
        try {
            if (!username) {
                return false;
            }

            const response = await fetch(`/player_management/public-profile/${username}/`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const statusElement = this.shadowRoot.querySelector('.status');
                
                if (statusElement) {
                    const status = data.status?.toUpperCase() || 'OFF';
                    const isOnline = status === 'ONL';
                    
                    statusElement.textContent = this.getTranslation(isOnline ? 'online' : 'offline');
                    statusElement.className = `status ${isOnline ? 'online' : 'offline'}`;
                    statusElement.style.backgroundColor = isOnline ? '#2ecc71' : '#e74c3c';
                }
                return true;
            } else {
                if (this.statusInterval) {
                    clearInterval(this.statusInterval);
                    this.statusInterval = null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            if (this.statusInterval) {
                clearInterval(this.statusInterval);
                this.statusInterval = null;
            }
            return false;
        }
    }

    disconnectedCallback() {
        // Nettoyer l'intervalle lors de la déconnexion
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
        }

        // Nettoyer l'intervalle de vérification des amis
        if (this.friendsCheckInterval) {
            clearInterval(this.friendsCheckInterval);
            this.friendsCheckInterval = null;
        }

        // Retirer les écouteurs d'événements
        window.removeEventListener('friendRequestAccepted', this.fetchFriendData);
        window.removeEventListener('friendshipStatusChanged', this.fetchFriendData);
    }

    setupButtons() {
        const chatBtn = this.shadowRoot.querySelector('.chat-btn');
        const settingsBtn = this.shadowRoot.querySelector('.settings-btn');

        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                history.pushState({}, "", '/chat');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                history.pushState({}, "", '/settings');
                window.dispatchEvent(new PopStateEvent('popstate'));
            });
        }
    }
}

customElements.define("profile-page", ProfilePage);


