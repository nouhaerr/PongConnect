# 🕹️ Pong Connect (Transcendence)

A modern twist on the classic Pong game — built as part of the **Transcendence** project. Featuring real-time multiplayer gameplay and a sleek tournament mode.

## 🚀 Features

- 🎮 **Local Multiplayer** – Play with a friend on the same device.
- 🏆 **Tournament Mode** – Compete in a tournament.
- ⚡ Smooth gameplay experience with responsive controls.
- 🖥️ Intuitive UI built with Vanilla JS frontend.
- 🌱 Backend powered by Django RestFramework.

## 📸 Screenshots

<!-- You can add screenshots like this -->
![Gameplay Screenshot](path/to/your/screenshot1.png)
![Tournament Mode](path/to/your/screenshot2.gif)

## 🛠️ Tech Stack

- **Frontend:** Vanilla JS (SPA), HTML, CSS
- **Backend:** Python (Django RestAPI)
- **Database:** PostgreSQL
- **Deployment:** Docker

## 🧑‍💻 Getting Started

Clone the repo and run it locally:

```bash
git clone git@github.com:nouhaerr/PongConnect.git pong-connect
cd pong-connect
```
### 🔧 Environment Setup

Before running the project with Docker, create a `.env` file in the root directory. Here’s an example of what it might contain:

```env
SECRET_KEY='django-insecure-(w6my)#+n=a5^#-p*4vzq*+)#ph1jxo+&lqns6m#$(vzoqce$r'
FT_TRANSCEDENCE_HOST="localhost"
POSTGRES_USER=""
POSTGRES_PASSWORD=""
POSTGRES_DB="transcendence"
POSTGRES_HOST=""
POSTGRES_PORT=""
# Intra credentials
INTRA_CLIENT_ID=""
INTRA_CLIENT_SECRET=""
#PGADMIN credentials
PGADMIN_DEFAULT_EMAIL=""
PGADMIN_DEFAULT_PASSWORD=""
#FRONTEND URLs Public (https)
FRONTEND_URL="https://localhost/"

#BACKEND private URLs
PLAYER_MANAGEMENT_URL="/player_management/"
AUTHENTICATION_URL="/authentication/"
```
### 🐳 Using Docker

To build and run the project with Docker, use the provided Makefile:
```bash
make
```
This will build the containers and start the application.

## 🤝 Collaborators

- [**Badr**](https://github.com/SAINT-CLAIRE-MERODE) – Frontend development (SPA + responsive UI using Vanilla JS).
- [**Nouhaila**](https://github.com/nouhaerr) – Backend(user management), authentication, 2.0auth, and database management.
- [**Mahdi**](https://github.com/elmahdidiab) – Local multiplayer gameplay and tournament logic with match history.
- [**Hayat**](https://github.com/hayat100) – Development of the second game Tic-tac-toe.