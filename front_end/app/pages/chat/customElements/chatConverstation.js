import { chatConversation } from "../templates/chatConversation.js";
import "./chatDiscussion.js"

class ChatConversation extends HTMLElement{
    constructor(){
        super();
        console.log('im in constructor');

        this._database = null;
        this._receiverDB = null;
        this._sender = null;
        this._choiceId = null;
        this._chatSocket  = null;
        this.choiceBody = null;
    };

    updatelabel(){
        console.log("I'm in updateContent");

        this.insertAdjacentHTML("afterbegin", chatConversation.data(this._receiverDB));

        const profile = this.querySelector(".chat-conversation-profile");
        profile.addEventListener("click", () => this.profile());
    };

    /** @param {string} newValue */
    set receiver(newValue){
        console.log("im in chatconvesration receiver");
        this._receiverDB = newValue;
        console.log("---> receiver in chatconverstaion", this._receiverDB);

        this.updatelabel();
    };

    /** @param {string} newValue */
    set chatSocket(newValue){
        console.log("im in chatConversation setChatsocket");
        this._chatSocket = newValue;
    };

    choiceBodyClicked(event){
        console.log("im in choiceBody");
        
        const choice_container = this.choiceBody.querySelector(".choice-container");
        
        if (choice_container && !choice_container.contains(event.target))
            this.choiceBody.remove();
    };

    invite(){
        console.log("im in invite");
        this.choiceBody.remove();
    };

    block(){
        console.log("im in block");
        this.choiceBody.remove();

        this.querySelector("#chat-block").textContent = "Unblock";
        this.querySelector("#chat-block").id = "chat-unblock";

        this._chatSocket.send(JSON.stringify({
          "type": "Block"
        }));
    };

    unblock(){
        console.log("im in unblock");
        this.choiceBody.remove();

        this.querySelector("#chat-unblock").textContent = "Block";
        this.querySelector("#chat-unblock").id = "chat-block";

        this._chatSocket.send(JSON.stringify({
          "type": "UnBlock"
        }));
    };

    clear(){
        console.log("im in clear");
        this.choiceBody.remove();

        this._chatSocket.send(JSON.stringify({
            "type": "Clear"
          }));
    };

    choiceButtonClicked(choiceButton){
        console.log("------->", choiceButton.id);

        const db = [
            { choiceName: 'chat-invite-game', choiceFunc: this.invite.bind(this) },
            { choiceName: 'chat-block', choiceFunc: this.block.bind(this) },
            { choiceName: 'chat-unblock', choiceFunc: this.unblock.bind(this) },
            { choiceName: 'chat-clear', choiceFunc: this.clear.bind(this) },
        ]

        let data = db.find(e => e.choiceName === choiceButton.id) || {};

        data.choiceFunc();
    };

    updateChoice(){
        const chatPage = this.getRootNode().host;  // Get the <chat-page> element
        this.chatPageSection = chatPage.shadowRoot.querySelector(".chat-page");

        const wrapper = document.createElement("div");
        wrapper.innerHTML = chatConversation.choice(this._choiceId, this._receiverDB.username);

        while (wrapper.firstChild)
            this.chatPageSection.appendChild(wrapper.firstChild);        
    };

    profile(){
        console.log("im in profile");
    };

    choiceClicked(choice, index, menulist){
        console.log("choiceeee:", choice.id);

        this._choiceId = choice.id;

        if (index == 0)
            this.profile();
        else{
            this.updateChoice();
            
            this.choiceBody = this.chatPageSection.querySelector(".choice-body");
            this.choiceBody.addEventListener("click", (event) => this.choiceBodyClicked(event));

            const choiceButton = this.choiceBody.querySelector(`#${choice.id}`);
            choiceButton.addEventListener("click", () => this.choiceButtonClicked(choiceButton));

            const cancel = this.choiceBody.querySelector("#buttons").children[1];
            cancel.addEventListener("click", () => { this.choiceBody.remove(); });

        }   
    };

    documentClicked(event){
        const path = event.composedPath();

        if (this.menu.classList.contains("active") && !path.includes(this.menu))
            this.menu.classList.remove("active");
    };

    menuClicked(){
        if (!this.menu.classList.contains("active"))
            this.menu.classList.toggle("active");
        else
            this.menu.classList.remove("active");
    };

    playClicked(play){
        console.log("play Now");
    };

    setUpEventListeners(){
        const play = this.querySelector(".chat-friend-playNow");
        play.addEventListener("click", () => this.playClicked(play));

        this.menu = this.querySelector(".chat-conversation-menu");
        this.menu.addEventListener("click", () => this.menuClicked());

        const menuList = this.menu.querySelectorAll(".chat-conversation-menu-list > div");
        console.log("menulist = ", menuList);
        menuList.forEach((element, index, array) => {
            element.addEventListener('click', () => this.choiceClicked(element, index, array))
        });

        document.addEventListener("click", (event) => this.documentClicked(event));
    };

    connectedCallback(){
        console.log('im in connected call back');
        
        this.insertAdjacentHTML("beforeend", chatConversation.layout());

        this.setUpEventListeners();
    };
}

customElements.define("chat-conversation-header", ChatConversation);
