export const chatConversation = {
  layout(){
    return(`    
        <div class="chat-friend-playNow">Play now</div>

        <div class="chat-conversation-menu" tabindex="0">
          <img src= "/chat/assets/menu.png">
          <div class="tooltip">Menu</div>
          <div class="chat-conversation-menu-list">
            <div id="chat-view-profile">View profile</div>
            <div id="chat-invite-game">Invite to game</div>
            <div id="chat-block">Block</div>
            <div id="chat-clear">Clear chat</div>
          </div>
        </div>
    `);
  },

  data(data){
    let status;

    if (data.status === "ONL")
      status = "Online";
    else
      status = "Offline";
    
    return(`
      <div class="chat-conversation-label">
        <div class="chat-conversation-profile">
          <img class="chat-conversation-pic" src="${data.avatar}">
          <div class="tooltip">Profile</div>
        </div>

        <div class="chat-conversation-info">
          <div class="chat-conversation-name">${data.username}</div>
          <div class="chat-conversation-status ${status}">${status}</div>
        </div>
      </div>
    `);
  },

  choice(choiceId, username){
    const db = [
      {
          choiceId: 'chat-invite-game',
          label: 'Play Game!',
          description: `Would you like to invite ${username} to play a game? An invitation will be sent once you proceed. <span>WOULD YOU LIKE TO PLAY NOW?</span>`,
          button: 'Invite',
      },
      {
          choiceId: 'chat-block',
          label:`Block ${username}`,
          description: 'Blocking this user will stop all further messages and notifications from them. You can always unblock them later if you change your mind.<span>WOULD YOU LIKE TO PROCEED?</span>',
          button: 'Block',
      },
      {
          choiceId: 'chat-unblock',
          label:`Unblock ${username}`,
          description: '<span>WOULD YOU LIKE TO PROCEED?</span>',
          button: 'UnBlock',
      },
      {
          choiceId: 'chat-clear',
          label: 'Clear Chat',
          description: 'This chat will be empty but will remain in you chat list. This action cannot be undone.<span>WOULD YOU LIKE TO PROCEED?</span>',
          button: 'Clear',
      }
    ];
    
    let data = db.find(e => e.choiceId === choiceId) || {};

    return(`
      <div class="choice-body">
        <div class="choice-container">
            <div id="chat-choice-label">${data.label}</div>
        
            <div id="chat-choice-description">${data.description}</div>
        
            <div id="buttons">
               <button id="${data.choiceId}">${data.button}</button>
               <button>Cancel</button>
            </div>
        </div>
      </div>
    `);
  },
}
