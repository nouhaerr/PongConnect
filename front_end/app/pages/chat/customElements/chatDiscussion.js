// import { chatDiscussion } from "../templates/chatDiscussion.js";

// class ChatDiscussion extends HTMLElement{
//   constructor(){
//     super();
//     // console.log('im in chatDiscussion constructor');

//     this._database = null;
//     this._receiverDB = null;
//     this._senderDB = null;
//     this._chatSocket = null;
//     this.isOpened = false;
//   };

//   connectedCallback(){
//     // console.log('im in chatDiscussion connected call back');
    
//     this.insertAdjacentHTML("beforeend", chatDiscussion.layout());

//     this.chatPage = this.getRootNode().host;
//   }

//   disconnectedCallback(){
//     // console.log("ChatDiscussion is being removed, cleaning up listeners.");
//   }

//   oldMessages(messageDB){
//     // console.log("im in oldMessages()")
//     if (messageDB){
//       console.log("im in messageDB");
//       this.chatMessages.append(chatDiscussion.MessageDatabase(messageDB, this._senderDB, this._receiverDB));
//     }
//       // chatDiscussion.MessageDatabase(messageDB, sender);
//   }

//   receive(event){
//     let data = JSON.parse(event.data);

//     console.log("*** Received WebSocket Message ***");
//     console.log("***type = ", data.type);
//     console.log("***message = ", data.message);
//     console.log("***MessageDataBase = ", data.MessageDataBase)
//     console.log("***sender = ", data.sender);
//     console.log("Receiver:", this._receiverDB ? this._receiverDB.username : "Not Set");

//     if (data.type == "message_data"){
//       this.oldMessages(data.MessageDataBase);
//     }
//     else if (data.type == "clear")
//       this.chatMessages.textContent = null;
//     else if (data.type == "chat"){
//       if (this._receiverDB.username === data.sender){
//         this.chatMessages.insertAdjacentHTML("beforeend", chatDiscussion.friendBox(this._receiverDB.avatar, data.message));
//         console.log(this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent)
//         this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent = data.message;
//       }
//       else
//         console.log(`Ignoring message from ${data.sender} (not the active chat)`);
//     }
//   };

//   send(event, form){
//     event.preventDefault();
//     let formData = new FormData(form)
//     let message = formData.get('message')

//     if (message && this._chatSocket) {
//       console.log("message = ", message);
      
//       this._chatSocket.send(JSON.stringify({
//         "type": "chat",
//         "message": message,
//       }));

//       this.chatMessages.insertAdjacentHTML("beforeend", chatDiscussion.MyBox(this._senderDB.avatar, message));
    
//       console.log(this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent)

//       this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent = message;
//     }
//     form.reset()
//   };

//   setUpEventListeners(){
//     // console.log("77777777777777-> im listening");

//     if (this._chatSocket){
//       this._chatSocket.removeEventListener("message", this._boundReceiveHandler);
//       this._boundReceiveHandler = (event) => this.receive(event);
//       this._chatSocket.addEventListener("message", this._boundReceiveHandler);
//     }
    
//     const MessageBar = this.querySelector(".chat-message-bar"); 
//     const form = MessageBar.querySelector(".chat-form");
//     const submit = MessageBar.querySelector("#send-button");

//     form.removeEventListener("submit", this._submitHandler);
//     submit.removeEventListener("click", this._submitHandler);

//     this._submitHandler = (event) => this.send(event, form);
//     form.addEventListener("submit", (event) => this.send(event, form));
//     submit.addEventListener("click", (event) => this.send(event, form));
//   };

//   updateMessages(){
//     if (this._chatSocket){
//       this._chatSocket.send(JSON.stringify({
//         'type' : "receiver",
//         'receiver': this._receiverDB.username,
//       }));
//     }

//     this.chatMessages = document.createElement("div");
//     this.chatMessages.classList.add("chat-messages");
//     this.insertAdjacentElement("afterbegin", this.chatMessages);

//     if (this._chatSocket){
//       this._chatSocket.send(JSON.stringify({
//         'type' : "message_data",
//       }));
//     }

//     this.setUpEventListeners();
//   }

//   /** @param {string} newValue */
//   set receiver(newValue){
//     this._receiverDB = newValue;
//     console.log("receiver = ", this._receiverDB);

//     this.updateMessages();
//   }

//   /** @param {string} newValue */
//   set sender(newValue){
//     console.log("im in chatDiscussion setSender");
//     this._senderDB = newValue;

//     console.log("sender = ", this._senderDB);
//   }

//   /** @param {string} newValue */
//   set chatSocket(newValue){
//     console.log("im in chatDiscussion setChatsocket");

//     this._chatSocket = newValue;
//     console.log(this._chatSocket);
//   }
// }

// customElements.define("chat-discussion", ChatDiscussion);

// // disconnectedCallback() {
// //   console.log("Chat component removed!");

// //   // **Close WebSocket**
// //   if (this._chatSocket) {
// //       console.log("Closing WebSocket...");
// //       this._chatSocket.close();
// //       this._chatSocket = null;
// //   }

// //   // **Remove event listeners**
// //   this.removeEventListener("click", this.handleClick);

// //   // **Clear intervals or timeouts**
// //   if (this._interval) {
// //       clearInterval(this._interval);
// //       this._interval = null;
// //   }

// //   // **Disconnect Observers (if any)**
// //   if (this._observer) {
// //       this._observer.disconnect();
// //       this._observer = null;
// //   }
// // }

// // disconnectedCallback() {
// //   console.log("Chat component removed!");

// //   // **Close WebSocket**
// //   if (this._chatSocket) {
// //       console.log("Closing WebSocket...");
// //       this._chatSocket.close();
// //       this._chatSocket = null;
// //   }

// //   // **Remove tracked event listeners**
// //   this._eventListeners.forEach((listener, element) => {
// //       element.removeEventListener("click", listener);
// //   });

// //   // **Clear the WeakMap**
// //   this._eventListeners = new WeakMap();

// //   console.log("All event listeners removed.");
// // }

// // function handleMessages(messages) {
// //   // Iterate through all the messages and print out details
// //   messages.forEach(message => {
// //       console.log(`Message ID: ${message.id}`);
// //       console.log(`Conversation ID: ${message.conversation_id}`);
// //       console.log(`Sender: ${message.sender}`);
// //       console.log(`Receiver: ${message.receiver}`);
// //       console.log(`Message: ${message.message}`);

// //       // Optionally, append the message to the chat UI
// //       const chatBox = document.getElementById("chat-box");
// //       const messageElement = document.createElement("div");
// //       messageElement.classList.add("message");

// //       messageElement.innerHTML = `
// //           <strong>${message.sender}</strong> to <strong>${message.receiver}</strong>: 
// //           <p>${message.message}</p>
// //       `;

// //       chatBox.appendChild(messageElement);
// //   });
// // }




// ----------------====================================



import { chatDiscussion } from "../templates/chatDiscussion.js";

class ChatDiscussion extends HTMLElement{
  constructor(){
    super();
    // console.log('im in chatDiscussion constructor');

    this._database = null;
    this._receiverDB = null;
    this._senderDB = null;
    this._chatSocket = null;
    this.isOpened = false;
  };

  connectedCallback(){
    // console.log('im in chatDiscussion connected call back');
    
    this.insertAdjacentHTML("beforeend", chatDiscussion.layout());

    this.chatPage = this.getRootNode().host;
  }

  disconnectedCallback(){
    // console.log("ChatDiscussion is being removed, cleaning up listeners.");
  }

  oldMessages(messageDB){
    // console.log("im in oldMessages()")
    if (messageDB){
      console.log("im in messageDB");
      this.chatMessages.append(chatDiscussion.MessageDatabase(messageDB, this._senderDB, this._receiverDB));
    }
      // chatDiscussion.MessageDatabase(messageDB, sender);
  }

  receive(event) {
    let data = JSON.parse(event.data);
  
    console.log("*** Received WebSocket Message ***");
    console.log("***type = ", data.type);
    console.log("***message = ", data.message);
    console.log("***MessageDataBase = ", data.MessageDataBase)
    console.log("***sender = ", data.sender);
    console.log("Receiver:", this._receiverDB ? this._receiverDB.username : "Not Set");
  
    if (data.type == "message_data"){
      this.oldMessages(data.MessageDataBase);
    }
    else if (data.type == "clear")
      this.chatMessages.textContent = null;
    else if (data.type == "chat"){
      if (this._receiverDB.username === data.sender){
        this.chatMessages.insertAdjacentHTML("beforeend", chatDiscussion.friendBox(this._receiverDB.avatar, data.message));
        console.log(this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent)
        this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent = data.message;
      }
      else
        console.log(`Ignoring message from ${data.sender} (not the active chat)`);
    }
  }

  send(event, form){
    event.preventDefault();
    let formData = new FormData(form)
    let message = formData.get('message')

    if (message && this._chatSocket) {
      console.log("message = ", message);
      
      this._chatSocket.send(JSON.stringify({
        "type": "chat",
        "message": message,
      }));

      this.chatMessages.insertAdjacentHTML("beforeend", chatDiscussion.MyBox(this._senderDB.avatar, message));
    
      console.log(this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent)

      this.chatPage.shadowRoot.querySelector(".chat-LastMessage").textContent = message;
    }
    form.reset()
  };

  setUpEventListeners(){
    // console.log("77777777777777-> im listening");

    if (this._chatSocket){
      this._chatSocket.removeEventListener("message", this._boundReceiveHandler);
      this._boundReceiveHandler = (event) => this.receive(event);
      this._chatSocket.addEventListener("message", this._boundReceiveHandler);
    }
    
    const MessageBar = this.querySelector(".chat-message-bar"); 
    const form = MessageBar.querySelector(".chat-form");
    const submit = MessageBar.querySelector("#send-button");

    form.removeEventListener("submit", this._submitHandler);
    submit.removeEventListener("click", this._submitHandler);

    this._submitHandler = (event) => this.send(event, form);
    form.addEventListener("submit", (event) => this.send(event, form));
    submit.addEventListener("click", (event) => this.send(event, form));
  };

  updateMessages(){
    if (this._chatSocket){
      this._chatSocket.send(JSON.stringify({
        'type' : "receiver",
        'receiver': this._receiverDB.username,
      }));
    }

    this.chatMessages = document.createElement("div");
    this.chatMessages.classList.add("chat-messages");
    this.insertAdjacentElement("afterbegin", this.chatMessages);

    if (this._chatSocket){
      this._chatSocket.send(JSON.stringify({
        'type' : "message_data",
      }));
    }

    this.setUpEventListeners();
  }

  /** @param {string} newValue */
  set receiver(newValue){
    this._receiverDB = newValue;
    console.log("receiver = ", this._receiverDB);

    this.updateMessages();
  }

  /** @param {string} newValue */
  set sender(newValue){
    console.log("im in chatDiscussion setSender");
    this._senderDB = newValue;

    console.log("sender = ", this._senderDB);
  }

  /** @param {string} newValue */
  set chatSocket(newValue){
    console.log("im in chatDiscussion setChatsocket");

    this._chatSocket = newValue;
    console.log(this._chatSocket);
  }
}

customElements.define("chat-discussion", ChatDiscussion);
