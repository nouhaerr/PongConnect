# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# from asgiref.sync import sync_to_async
# from .models import Player
# from .models import Message
# from .models import Conversation
# from collections import defaultdict
# from player_management.models import Friendship
# from player_management.utils import block_user, unblock_user

# Block_chain = defaultdict(list)

# class ChatConsumer(AsyncWebsocketConsumer):

#   @sync_to_async(thread_sensitive=False)
#   def fetch_all_players(self):
#     return list(Player.objects.all())
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def fetch_all_friendsRequest(self):
#     return list(Friendship.objects.select_related('sender', 'receiver').all())
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def fecth_all_conversations(self):
#     return list(Conversation.objects.all())
# #-----------------------------------------------------------------------------------------
#   # @sync_to_async(thread_sensitive=False)
#   # def fetch_user_conversations(user):
#   #   return list(Conversation.objects.filter(user1=user) | Conversation.objects.filter(user2=user))
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=True)
#   def get_the_last_message(self, conversation):
#       messages = conversation.messages.all()
#       if messages:
#         return messages[len(messages) - 1].message
#       else:
#         return None
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def get_friends(self, friend_requests):
#     friends = []
#     for friend_request in friend_requests:
#         user1 = friend_request.sender
#         user2 = friend_request.receiver

#         if user1.username == self.username and friend_request.status == "ACC":
#             friends.append(user2)
#         elif user2.username == self.username and friend_request.status == "ACC":
#             friends.append(user1)

#     return friends
# #-----------------------------------------------------------------------------------------
#   async def get_or_create_user_conversations(self):
#     conversations = []
#     for friend in self.friends:
#       conversation, created = await self.get_or_create_conversation(self.userdb, friend)
#       print("convesration = ", conversation)
#       conversation.lastmessage = await self.get_the_last_message(conversation)

#       if conversation.lastmessage:
#         await sync_to_async(conversation.save)()

#       conversations.append(conversation)

#     return conversations
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def get_user_data(self, players):
#     for player in players:
#       print("player.username = ", player.username)
#       if player.username == self.username:
#         return(player)
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def get_convesration_data(self, conversation):
#     print("--------status??")
#     print(conversation.user1)
#     print(conversation.user2)
#     data = {
#         "user1": {
#             "username": conversation.user1.username,
#             "avatar": conversation.user1.avatar,
#             "status": conversation.user1.status
#         },
#         "user2": {
#             "username": conversation.user2.username,
#             "avatar": conversation.user2.avatar,
#             "status": conversation.user2.status
#         },
#         "last_message": conversation.last_message if conversation.last_message else "No messages yet"
#       }
#     return data
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=False)
#   def set_PLayer_channel_name(self):
#     print(f"Saving channel name for {self.userdb.username}: {self.channel_name}")
#     self.userdb.channel_name = self.channel_name
#     self.userdb.save()
#     # await sync_to_async(self.userdb.save)()

# #-----------------------------------------------------------------------------------------
#   async def connect(self):
#     self.username = self.scope['url_route']['kwargs']['username']
#     print(self.username, " Im connected")
    
#     all_convertations = await self.fecth_all_conversations()
#     print ("--------->all conversation= ", all_convertations)
    
#     await self.accept()
    
#     await self.send(
#       text_data=json.dumps({
#         'type': 'connection_established',
#         'message': 'you are now connected',
#       }))
    
#     players = await self.fetch_all_players()
#     print("all players =", players)
#     self.userdb = await self.get_user_data(players)
#     print("user_data = ", self.userdb)
#     await self.set_PLayer_channel_name()
#     print("88888888888888888888888user_data chaneeeeel name = ", self.userdb.channel_name)

#     user_data_base = {
#       "username": self.userdb.username, 
#       "avatar": self.userdb.avatar, 
#       "status": self.userdb.status, 
#     }
#     await self.send(
#       text_data=json.dumps({
#         'type': "user_data",
#         'UserDataBase': user_data_base,
#       }))
    
#     friend_requests = await self.fetch_all_friendsRequest()
#     self.friends = await self.get_friends(friend_requests)
#     print("friends = ", self.friends)

#     self.conversations = await self.get_or_create_user_conversations()

#     conversations_data_base = []
#     for conversation in self.conversations:
#       data = await self.get_convesration_data(conversation)
#       conversations_data_base.append(data)
#     print("convdb = ", conversations_data_base)

#     await self.send(
#       text_data=json.dumps({
#         'type': "conversations_data",
#         'ConvesrationsDataBase': conversations_data_base,
#       }))

#     # friends_data_base = []
#     # for friend in friends:
#     #   data = {
#     #     "username": friend.username, 
#     #     "avatar": friend.avatar, 
#     #     "status": friend.status,
#     #   }
#     #   friends_data_base.append(data)
#     # print(friends_data_base)
    
# #-----------------------------------------------------------------------------------------
#   async def disconnect(self, close_code):
#     await self.send(
#       text_data=json.dumps({
#         'type': 'connection_closed',
#         'message': 'you are now disconnected',
#       }))
#     # pass
#     # Remove the channel from the group
#     # await self.channel_layer.group_discard(
#     #     self.room_group_name,
#     #     self.channel_name
#     # )
# #-----------------------------------------------------------------------------------------
#   async def get_or_create_conversation(self, user1, user2):
#     user1, user2 = sorted([user1, user2], key=lambda u: u.id)
#     return await sync_to_async(Conversation.objects.get_or_create, thread_sensitive=True)(
#         user1=user1, user2=user2
#     )
# #----------------------------------------------------------------------------------------- 
#   # async def block(self):
#   #   Block_chain[self.username].append(self.receiver)
#   #   await self.send(
#   #     text_data=json.dumps({
#   #       'type': "block",
#   #       'message': f"You blocked this user ({self.receiver})",
#   #     }))
# #----------------------------------------------------------------------------------------- 
#   # async def unblock(self):
#   #   if self.receiver in Block_chain[self.username]:
#   #     Block_chain[self.username].remove(self.receiver)
#   #     await self.send(
#   #       text_data=json.dumps({
#   #         'type': "unblock",
#   #         'message': f"You Unblocked this user ({self.receiver})",
#   #       }))
#   async def block(self):
#     result = await sync_to_async(block_user, thread_sensitive=True)(self.username, self.receiver)
#     await self.send(text_data=json.dumps({
#         "type": "block",
#         "message": result.get("success") or result.get("error")
#     }))

#   async def unblock(self):
#     result = await sync_to_async(unblock_user, thread_sensitive=True)(self.username, self.receiver)
#     await self.send(text_data=json.dumps({
#         "type": "unblock",
#         "message": result.get("success") or result.get("error")
#     }))
# #-----------------------------------------------------------------------------------------
#   async def clear(self):
#     print("cleaaar messages")
#     if await sync_to_async(self.conversation.messages.exists, thread_sensitive=True)():
#       sync_to_async(self.conversation.messages.all().delete, thread_sensitive=True)()
#       await self.send(
#       text_data=json.dumps({
#         'type': "clear",
#         'message': "messages are now cleared",
#       }))
    
# #-----------------------------------------------------------------------------------------
#   async def youBlocked(self):
#     await self.send(
#       text_data=json.dumps({
#         'type': "block_message",
#         'message': f"You blocked this user ({self.receiver})",
#       }))
# #-----------------------------------------------------------------------------------------
#   async def gotBlocked(self):
#     await self.send(
#       text_data=json.dumps({
#         'type': "unblock_message",
#         'message': f"this user ({self.receiver}) has Blocked u",
#       }))
#   #-----------------------------------------------------------------------------------------
#   async def chat(self, data_json):
#     print("im in chat")

#     message = data_json.get('message')
#     print("message = ", message)

#     print("i'm ", self.username, "i'll text ", self.receiver)
#     print("i'm ", self.username, "i'll text ", self.receiverdb)
    
#     print(f"Receiver: {self.receiver}, ReceiverDB: {self.receiverdb}, Channel: {self.receiverdb.channel_name}")


#     # Ensure receiver is properly fetched
#     if not self.receiverdb:
#         print(f"Error: Receiver {self.receiver} not found in friends list!")
#         return

#     # Get or create the conversation
#     self.conversation, created = await self.get_or_create_conversation(self.userdb, self.receiverdb)

#     # Ensure conversation is not None
#     if not self.conversation:
#         print("Error: Could not retrieve or create conversation!")
#         return

#     print("self.userdb.channel_name=======", self.userdb.username, " ", self.userdb.channel_name)
#     print("self.receiverdb.channel_name=======", self.receiverdb.username, " ", self.receiverdb.channel_name)
#     if not self.receiverdb.channel_name:
#       print(f"Error: {self.receiver} is not connected!")
#       return

#     # user1 = self.username
#     # user2 = self.receiver
#     # conversation, created = await self.get_or_create_conversation(self.userdb, self.receiverdb)
#     # print(conversation)
#     message_obj = await sync_to_async(Message.objects.create, thread_sensitive=True)(
#     conversation=self.conversation, sender=self.userdb.username, receiver=self.receiver, message=message)
#     print(message_obj)
#     self.conversation.last_message = message
#     await sync_to_async(self.conversation.save)()

#     print(message_obj.message)
#     await self.channel_layer.send(
#       self.receiverdb.channel_name,
#       {
#         'type': "chat.message",
#         'message': message_obj.message,
#         'sender': message_obj.sender,
#       })
# #-----------------------------------------------------------------------------------------
#   @sync_to_async(thread_sensitive=True)
#   def fetch_all_messages(self):
#       return list(self.conversation.messages.all())

#   async def messageData(self):
#     print("im in message_data")
#     print("userdb2 = ", self.userdb)
#     print("recieverdb2 = ", self.receiverdb)
#     self.conversation, created = await self.get_or_create_conversation(self.userdb, self.receiverdb)
#     print(self.conversation)

#     messages = await self.fetch_all_messages()
#     self.conversation.last_message = await self.get_the_last_message(self.conversation)
#     await sync_to_async(self.conversation.save)()
#     print("messages = ", messages)

#     message_data_base = []
#     for message in messages:
#         message_data = {
#             "id": message.id,
#             "conversation_id": message.conversation.id,
#             "sender": message.sender,
#             "receiver": message.receiver,
#             "message": message.message,
#         }
#         message_data_base.append(message_data)
#     # Now message_data_list contains dictionaries for all the messages
#     print("msgdb = ", message_data_base)
#     await self.send(
#       text_data=json.dumps({
#         'type': "message_data",
#         'MessageDataBase': message_data_base,
#       }))
# #-----------------------------------------------------------------------------------------
#   async def fetch_receiver(self, data_json):
#     self.receiver = data_json.get('receiver')
#     print("receiver name = ", self.receiver)
#     for friend in self.friends:
#       if friend.username == self.receiver:
#         self.receiverdb = friend
#         return friend
# #-----------------------------------------------------------------------------------------
#   async def chat_message(self, event):
#     print(f"Sending message from {event['sender']} to receiver: {event['message']}")
#     await self.send(
#       text_data=json.dumps({
#         'type': "chat",
#         'message': event['message'],
#         'sender': event['sender'],
#       }))
# #-----------------------------------------------------------------------------------------
#   async def receive(self, text_data):
#     data_json = json.loads(text_data)
#     type = data_json.get('type')
#     print("type = " , type)

#     keys = []
#     values = []

#     for k, v in Block_chain.items():
#       if self.username in k:
#         values.extend(v)
#       if self.username in v:
#         keys.append(k)
  
#     if type == 'receiver':
#       await self.fetch_receiver(data_json)
#       print("recieverdb = ", self.receiverdb)
#     elif type == 'Block':
#       await self.block()
#     elif type == 'UnBlock':
#       await self.unblock()
#     elif type == 'Clear':
#       await self.clear()
#     elif self.receiver in values:
#       await self.youBlocked()
#     elif self.receiver in keys:
#       await self.gotBlocked()
#     elif type == 'chat':
#       await self.chat(data_json)
#     elif type == 'message_data':
#       await self.messageData()

# # active_connection fill it with the connected user object 

# #add a cannel nmae varibale to the player

# #when i set the websocket inside the chat if i did't enter it and a ueerr text
# #me i won;'t receive the message

# #the position where front send 
# # async def get_receiver(self, data_json):
# #     self.receiver = data_json.get('receiver')
# # search in the friends for the reciver user
# # and affect it to the self.receiver




# ------------------------------------------===================


from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
from .models import Player
from .models import Message
from .models import Conversation
from collections import defaultdict
from player_management.models import Friendship
from player_management.utils import block_user, unblock_user

Block_chain = defaultdict(list)

class ChatConsumer(AsyncWebsocketConsumer):

  @sync_to_async(thread_sensitive=False)
  def fetch_all_players(self):
    return list(Player.objects.all())
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def fetch_all_friendsRequest(self):
    return list(Friendship.objects.select_related('sender', 'receiver').all())
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def fecth_all_conversations(self):
    return list(Conversation.objects.all())
#-----------------------------------------------------------------------------------------
  # @sync_to_async(thread_sensitive=False)
  # def fetch_user_conversations(user):
  #   return list(Conversation.objects.filter(user1=user) | Conversation.objects.filter(user2=user))
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=True)
  def get_the_last_message(self, conversation):
      messages = conversation.messages.all()
      if messages:
        return messages[len(messages) - 1].message
      else:
        return None
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def get_friends(self, friend_requests):
    friends = []
    for friend_request in friend_requests:
        user1 = friend_request.sender
        user2 = friend_request.receiver

        if user1.username == self.username and friend_request.status == "ACC":
            friends.append(user2)
        elif user2.username == self.username and friend_request.status == "ACC":
            friends.append(user1)

    return friends
#-----------------------------------------------------------------------------------------
  async def get_or_create_user_conversations(self):
    conversations = []
    for friend in self.friends:
      conversation, created = await self.get_or_create_conversation(self.userdb, friend)
      print("convesration = ", conversation)
      conversation.lastmessage = await self.get_the_last_message(conversation)

      if conversation.lastmessage:
        await sync_to_async(conversation.save)()

      conversations.append(conversation)

    return conversations
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def get_user_data(self, players):
    for player in players:
      print("player.username = ", player.username)
      if player.username == self.username:
        return(player)
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def get_convesration_data(self, conversation):
    print("--------status??")
    print(conversation.user1)
    print(conversation.user2)
    data = {
        "user1": {
            "username": conversation.user1.username,
            "avatar": conversation.user1.avatar,
            "status": conversation.user1.status
        },
        "user2": {
            "username": conversation.user2.username,
            "avatar": conversation.user2.avatar,
            "status": conversation.user2.status
        },
        "last_message": conversation.last_message if conversation.last_message else "No messages yet"
      }
    return data
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=False)
  def set_PLayer_channel_name(self):
    # Get fresh data from the database to ensure we have current info
    fresh_player = Player.objects.get(id=self.userdb.id)
    print(f"UPDATING channel name for {fresh_player.username}: {self.channel_name}")
    fresh_player.channel_name = self.channel_name
    fresh_player.save()
    # Update the local reference too
    self.userdb = fresh_player
    return fresh_player

#-----------------------------------------------------------------------------------------
  async def connect(self):
    self.username = self.scope['url_route']['kwargs']['username']
    print(f"⭐️ CONNECT: {self.username} with channel {self.channel_name}")
    
    # Join a group for this user so we can send them messages
    user_group = f"user_{self.username}"
    await self.channel_layer.group_add(user_group, self.channel_name)
        
    all_convertations = await self.fecth_all_conversations()
    print ("--------->all conversation= ", all_convertations)
    
    await self.accept()
    
    await self.send(
      text_data=json.dumps({
        'type': 'connection_established',
        'message': 'you are now connected',
      }))
    
    players = await self.fetch_all_players()
    print("all players =", players)
    self.userdb = await self.get_user_data(players)
    print("user_data = ", self.userdb)
    await self.set_PLayer_channel_name()
    print("88888888888888888888888user_data chaneeeeel name = ", self.userdb.channel_name)

    user_data_base = {
      "username": self.userdb.username, 
      "avatar": self.userdb.avatar, 
      "status": self.userdb.status, 
    }
    await self.send(
      text_data=json.dumps({
        'type': "user_data",
        'UserDataBase': user_data_base,
      }))
    
    friend_requests = await self.fetch_all_friendsRequest()
    self.friends = await self.get_friends(friend_requests)
    print("friends = ", self.friends)

    self.conversations = await self.get_or_create_user_conversations()

    conversations_data_base = []
    for conversation in self.conversations:
      data = await self.get_convesration_data(conversation)
      conversations_data_base.append(data)
    print("convdb = ", conversations_data_base)

    await self.send(
      text_data=json.dumps({
        'type': "conversations_data",
        'ConvesrationsDataBase': conversations_data_base,
      }))

    # friends_data_base = []
    # for friend in friends:
    #   data = {
    #     "username": friend.username, 
    #     "avatar": friend.avatar, 
    #     "status": friend.status,
    #   }
    #   friends_data_base.append(data)
    # print(friends_data_base)
    
#-----------------------------------------------------------------------------------------
  async def disconnect(self, close_code):
    print(f"⭐️ DISCONNECT: {self.username} with channel {self.channel_name}")
    user_group = f"user_{self.username}"
    await self.channel_layer.group_discard(user_group, self.channel_name)
    
    # Important: Clear the channel name when disconnecting
    if hasattr(self, 'userdb') and self.userdb:
        await sync_to_async(self._clear_channel_name, thread_sensitive=True)()
    
    await self.send(
        text_data=json.dumps({
            'type': 'connection_closed',
            'message': 'you are now disconnected',
        }))
    
  @sync_to_async(thread_sensitive=True)
  def _clear_channel_name(self):
    self.userdb.channel_name = ""
    self.userdb.save()

  # Add this method
  async def send_user_message(self, username, message_data):
    """Send a message to a specific user via their group"""
    user_group = f"user_{username}"
    print(f"⭐️ Sending to group {user_group}: {message_data}")
    await self.channel_layer.group_send(
        user_group,
        message_data
    )
#-----------------------------------------------------------------------------------------
  async def get_or_create_conversation(self, user1, user2):
    user1, user2 = sorted([user1, user2], key=lambda u: u.id)
    return await sync_to_async(Conversation.objects.get_or_create, thread_sensitive=True)(
        user1=user1, user2=user2
    )
#----------------------------------------------------------------------------------------- 
  # async def block(self):
  #   Block_chain[self.username].append(self.receiver)
  #   await self.send(
  #     text_data=json.dumps({
  #       'type': "block",
  #       'message': f"You blocked this user ({self.receiver})",
  #     }))
#----------------------------------------------------------------------------------------- 
  # async def unblock(self):
  #   if self.receiver in Block_chain[self.username]:
  #     Block_chain[self.username].remove(self.receiver)
  #     await self.send(
  #       text_data=json.dumps({
  #         'type': "unblock",
  #         'message': f"You Unblocked this user ({self.receiver})",
  #       }))
  async def block(self):
    result = await sync_to_async(block_user, thread_sensitive=True)(self.username, self.receiver)
    await self.send(text_data=json.dumps({
        "type": "block",
        "message": result.get("success") or result.get("error")
    }))

  async def unblock(self):
    result = await sync_to_async(unblock_user, thread_sensitive=True)(self.username, self.receiver)
    await self.send(text_data=json.dumps({
        "type": "unblock",
        "message": result.get("success") or result.get("error")
    }))
#-----------------------------------------------------------------------------------------
  async def clear(self):
    print("cleaaar messages")
    if await sync_to_async(self.conversation.messages.exists, thread_sensitive=True)():
        await sync_to_async(lambda: self.conversation.messages.all().delete(), thread_sensitive=True)()
        await self.send(
            text_data=json.dumps({
                'type': "clear",
                'message': "messages are now cleared",
            })
    )
    
#-----------------------------------------------------------------------------------------
  async def youBlocked(self):
    await self.send(
      text_data=json.dumps({
        'type': "block_message",
        'message': f"You blocked this user ({self.receiver})",
      }))
#-----------------------------------------------------------------------------------------
  async def gotBlocked(self):
    await self.send(
      text_data=json.dumps({
        'type': "unblock_message",
        'message': f"this user ({self.receiver}) has Blocked u",
      }))
  #-----------------------------------------------------------------------------------------

  # In the ChatConsumer class, the chat method should be properly indented:
  async def chat(self, data_json):
    print("im in chat")
    message = data_json.get('message')
    print("message = ", message)
    print("i'm ", self.username, "i'll text ", self.receiver)
    
    # Force refresh of receiver from database
    players = await self.fetch_all_players()
    for player in players:
        if player.username == self.receiver:
            self.receiverdb = player
            break
    
    if not self.receiverdb:
        print(f"ERROR: Could not find receiver {self.receiver} in database!")
        return
      
    print(f"RECEIVER STATUS: username={self.receiverdb.username}, channel={self.receiverdb.channel_name}")
  
    # Create or get conversation
    self.conversation, created = await self.get_or_create_conversation(self.userdb, self.receiverdb)
  
    # Create message
    message_obj = await sync_to_async(Message.objects.create, thread_sensitive=True)(
        conversation=self.conversation, sender=self.userdb.username, receiver=self.receiver, message=message)
    
    self.conversation.last_message = message
    await sync_to_async(self.conversation.save)()
  
    # CRITICAL: If no channel name, try to fetch fresh data
    if not self.receiverdb.channel_name:
        print(f"WARNING: No channel for {self.receiver}, refreshing from database")
        fresh_receiver = await sync_to_async(Player.objects.get, thread_sensitive=True)(username=self.receiver)
        if fresh_receiver.channel_name:
            self.receiverdb = fresh_receiver
            print(f"UPDATED channel for {self.receiver}: {self.receiverdb.channel_name}")
  
    # Send the message if we have a channel
    if self.receiverdb.channel_name:
        print(f"SENDING to {self.receiver} on channel {self.receiverdb.channel_name}")
        try:
            await self.send_user_message(self.receiver, {
                'type': "chat.message",
                'message': message_obj.message,
                'sender': message_obj.sender,
            })
            print(f"MESSAGE SENT to {self.receiver}")
        except Exception as e:
            print(f"ERROR sending to {self.receiver}: {str(e)}")
    else:
        print(f"ERROR: Cannot send - {self.receiver} has no channel after refresh!")
#-----------------------------------------------------------------------------------------
  @sync_to_async(thread_sensitive=True)
  def fetch_all_messages(self):
      return list(self.conversation.messages.all())

  async def messageData(self):
    print("im in message_data")
    print("userdb2 = ", self.userdb)
    print("recieverdb2 = ", self.receiverdb)
    self.conversation, created = await self.get_or_create_conversation(self.userdb, self.receiverdb)
    print(self.conversation)

    messages = await self.fetch_all_messages()
    self.conversation.last_message = await self.get_the_last_message(self.conversation)
    await sync_to_async(self.conversation.save)()
    print("messages = ", messages)

    message_data_base = []
    for message in messages:
        message_data = {
            "id": message.id,
            "conversation_id": message.conversation.id,
            "sender": message.sender,
            "receiver": message.receiver,
            "message": message.message,
        }
        message_data_base.append(message_data)
    # Now message_data_list contains dictionaries for all the messages
    print("msgdb = ", message_data_base)
    await self.send(
      text_data=json.dumps({
        'type': "message_data",
        'MessageDataBase': message_data_base,
      }))
#-----------------------------------------------------------------------------------------
  async def fetch_receiver(self, data_json):
    self.receiver = data_json.get('receiver')
    print("receiver name = ", self.receiver)
    for friend in self.friends:
      if friend.username == self.receiver:
        self.receiverdb = friend
        return friend
#-----------------------------------------------------------------------------------------
  async def chat_message(self, event):
    print(f"Sending message from {event['sender']} to receiver: {event['message']}")
    await self.send(
      text_data=json.dumps({
        'type': "chat",
        'message': event['message'],
        'sender': event['sender'],
      }))
#-----------------------------------------------------------------------------------------
  async def receive(self, text_data):
    data_json = json.loads(text_data)
    type = data_json.get('type')
    print("type = " , type)

    keys = []
    values = []

    for k, v in Block_chain.items():
      if self.username in k:
        values.extend(v)
      if self.username in v:
        keys.append(k)
  
    if type == 'receiver':
      await self.fetch_receiver(data_json)
      print("recieverdb = ", self.receiverdb)
    elif type == 'Block':
      await self.block()
    elif type == 'UnBlock':
      await self.unblock()
    elif type == 'Clear':
      await self.clear()
    elif self.receiver in values:
      await self.youBlocked()
    elif self.receiver in keys:
      await self.gotBlocked()
    elif type == 'chat':
      await self.chat(data_json)
    elif type == 'message_data':
      await self.messageData()