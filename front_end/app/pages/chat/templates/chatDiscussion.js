export const chatDiscussion = {
  layout(){
    return(`
      <div class="chat-message-bar">
        <form class="chat-form">
          <input id="chat-input" type="text" placeholder="Your message ....." name="message">
          <div id="send-button">
            <img src= "/chat/assets/iconoir_send.png">
          </div>
        </form>
      </div>
    `);
  },

  friendBox(avatar, message){
    return(`
      <div class="friend-box">
        <img id="friend-profile" src=${avatar}>

        <div id="friend-message">${message}</div>
      </div>
    `);
  },

  MyBox(avatar, message){
    return(`
      <div class="my-box">
        <div id="my-message">${message}</div>                
      
        <img id="my-profile" src=${avatar}>
      </div>
    `);
  },

  MessageDatabase(messagedb, senderdb, receiverdb){
    const fragment = document.createDocumentFragment();

    
    messagedb.forEach((e) => {
      const tempDiv = document.createElement("div");

      if (senderdb.username == e.sender)
        tempDiv.innerHTML = this.MyBox(senderdb.avatar, e.message);
      else
        tempDiv.innerHTML = this.friendBox(receiverdb.avatar, e.message);

      fragment.appendChild(tempDiv);
    });

    return (fragment);
  },
}
