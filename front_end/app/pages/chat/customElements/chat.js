import { chat } from "../templates/chat.js";
import "./chatConverstation.js"

class ChatPage extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({ mode: "open" });

        this._chatSocket = null;
        this._sender = null;
        this.senderDB = null;
        this.friendsDB = null;

        console.log("Chat page created!");

        const stylesheets = [
            "/chat/css/index.css",
            "/chat/css/chat-conversation-header.css",
            "/chat/css/chat-conversation.css",
            "/chat/css/chat-friends.css",
        ];

        stylesheets.forEach((href) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            this.shadowRoot.appendChild(link);
        });

        // Utiliser wss:// pour HTTPS
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${this._sender}/`;
        this._chatSocket = new WebSocket(wsUrl);
    };

    addChatConversation(){
        console.log("im inside add conversation");

        this.chatConversation = document.createElement("section");
        this.chatConversation.classList.add("chat-conversation");
        this.chatPage.appendChild(this.chatConversation);

        this.chatHeader = document.createElement("chat-conversation-header");
        this.chatConversation.appendChild(this.chatHeader);

        this.chatDiscussion = document.createElement("chat-discussion");
        this.chatConversation.appendChild(this.chatDiscussion);
    }

    containerClicked(friendsContainer, index, array){
        console.log("im clicked!");
        let receiverDB;

        if (friendsContainer.classList.contains("active"))
            return ;

        friendsContainer.classList.toggle("active");

        const noConversation = this.shadowRoot.querySelector(".no-conversation");
        if (noConversation)
            noConversation.remove();

        const conversation = this.shadowRoot.querySelector(".chat-conversation");
        if (!conversation)
            this.addChatConversation();

        let label = this.chatHeader.querySelector(".chat-conversation-label");
        if (label)
            label.remove();

        let chatMessages = this.chatDiscussion.querySelector(".chat-messages");
        if (chatMessages){
            console.log("------------->chat messages are removed now!")
            chatMessages.remove();
        }

        this.chatHeader.chatSocket = this._chatSocket;
        this.chatDiscussion.chatSocket = this._chatSocket;

        this.chatDiscussion.sender = this.senderDB;

        let username = friendsContainer.querySelector(".chat-friend-name").textContent;
        for (let i = 0; i < this.conversationsDB.length; i++){
            if (this.conversationsDB[i].user1.username === username){
                receiverDB = this.conversationsDB[i].user1;
                break ;
            }
            else if (this.conversationsDB[i].user2.username === username){
                receiverDB = this.conversationsDB[i].user2;
                break ;
            }
        }

        console.log("receiverDB ==== ", receiverDB);
        //continueeeeeeeeeeeeeeeeeee
        this.chatHeader.receiver = receiverDB;
        this.chatDiscussion.receiver = receiverDB;

        for (let j = 0; j < array.length; j++){
            if (index !=j && array[j].classList.contains("active")){
              array[j].classList.remove("active");
            }
        }
    };

    setUpEventListeners(chatFriendsList){
        console.log("im in set");
        const friendsContainer = chatFriendsList.querySelectorAll('.chat-friend-container')
        
        friendsContainer.forEach((element, index, array) => {
            element.addEventListener('click', () => this.containerClicked(element, index, array))
        });
        console.log("im out");
    };

    addChatFriends(){
        console.log("im in addchatfriends")
        this.chatFriendsList = this.shadowRoot.querySelector(".chat-friends-list");
        this.chatFriendsList.appendChild(chat.friendsList(this.conversationsDB, this._sender));

        this.setUpEventListeners(this.chatFriendsList)
    };

    receive(event){
        let data = JSON.parse(event.data);

        if (data.type == "user_data")
            this.senderDB = data.UserDataBase;
        else if (data.type == "conversations_data"){
            this.conversationsDB = data.ConvesrationsDataBase;
            this.addChatFriends();
        }
    };

    openSocket(){
        console.log("socket is opened");

        if (this._chatSocket){
            this._chatSocket.removeEventListener("message", this._boundReceiveHandler);
            this._boundReceiveHandler = (event) => this.receive(event);
            this._chatSocket.addEventListener("message", this._boundReceiveHandler);
        }
    };

    startSocket(){
        let url = `wss://${window.location.host}/ws/socket-server/${this._sender}/`;
        this._chatSocket = new WebSocket(url);

        this._chatSocket.addEventListener("open", () => this.openSocket());
    };
    
    // /** @param {string} newValue */
    // set currentUser(newValue){
    //     this._sender = newValue;
    //     console.log("currentUSER = ", this._sender);
    //     this.startSocket();
    // }
    
    connectedCallback() {
        console.log("Chat page added to the DOM");

        const wrapper = document.createElement("section");
        wrapper.classList.add("chat-page");
        wrapper.innerHTML = chat.layout();
        this.shadowRoot.appendChild(wrapper);
        this.chatPage = wrapper;

        this.loadCurrentUser();
    };
    
    async loadCurrentUser() {
        try {
            const response = await fetch('/player_management/get_user_data/', {
                credentials: 'include'
            });
            const data = await response.json();
            this._sender = data.username;
            console.log('🔑 Current logged-in user:', this._sender);
            this.startSocket();
        } catch (error) {
            console.error('Error loading current user:', error);
        }
    };

    disconnectedCallback(){
        console.log("Chat page removed from the DOM");
        if (this._chatSocket && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this._chatSocket.readyState)) {
            this._chatSocket.close();
            console.log('WebSocket connection closing...');
        }
    };
}

customElements.define("chat-page", ChatPage);

// i won't get the sender with the prompte
// i will get it from playerManger Model
// i will send it as an object from the backend to the front

//let url = `ws://127.0.0.1:8000/ws/socket-server/${this._sender}/`; 
// i won't send the sender on socket

// active connections i will get them from all the objects of the model "?" who created an account


//don't send and receiver the userDB i will get it from th conversationDB

//switch the name of the chatconversation costum element to header