export const chat = {
    layout(){
        return (`
            <div class="chat-friends">
                <div class="chat-friends-header">Chats</div>

                <div class="chat-friends-list"></div>
            </div>

            <div class="no-conversation"></div>
            `);
    },

    friendContainer(db, username){
        let data;
        let status;

        if (db.user1.username == username)
            data = db.user2;
        else
            data = db.user1;

        console.log("data.username = ", data.username)
        console.log(username, " ", data.status)
        if (data.status === "ONL")
            status = "Online";
        else
            status = "Offline";

        console.log(username, " ", data.status)

        return (`<div class="chat-friend-container">
        <div class="chat-friend-profile">
        <img class="chat-profile-pic" src="${data.avatar}">
        <div class="chat-profile-status ${status}"></div>
        </div>

        <div class="chat-friend-content">
            <h2 class="chat-friend-name">${data.username}</h2>
            <p class="chat-LastMessage">${db.last_message}</p>
        </div>
        </div>`)
    },

    friendsList(db, username){
        const fragment = document.createDocumentFragment()

        db.forEach((e) => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = this.friendContainer(e, username);
    
            if (tempDiv.firstChild)
                fragment.appendChild(tempDiv.firstChild);
        });
        
        return fragment;
    }
}
