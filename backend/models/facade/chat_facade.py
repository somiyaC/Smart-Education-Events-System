from typing import Dict, List, Optional
from models.chat_model import ChatRoomModel, ChatMessageModel
from models.user_model import UserModel
from schemas.chat import ChatRoomSchema, ChatMessageSchema
from schemas.user import UserSchema

class ChatFacade:
    """
    Facade for simplified chat room and message interactions.
    Provides a simplified interface to the more complex subsystems.
    """
    
    def __init__(self):
        """
        Initialize the facade with service instances.
        """
        self.chat_room_model = ChatRoomModel
        self.chat_message_model = ChatMessageModel
        self.user_model = UserModel
    
    async def create_chat_room(self, event_id: str, name: str, description: str = "", 
                             is_private: bool = False, is_direct: bool = False, 
                             participants: List[str] = None) -> ChatRoomSchema:
        """
        Create a new chat room with simplified interface.
        
        Args:
            event_id: ID of the event
            name: Name of the chat room
            description: Optional description
            is_private: Whether the chat room is private
            is_direct: Whether it's a direct message room
            participants: List of user IDs
            
        Returns:
            ChatRoomSchema: Created chat room
        """
        chat_room_id = await self.chat_room_model.create_chat_room(
            event_id=event_id,
            name=name,
            description=description,
            is_private=is_private,
            is_direct=is_direct,
            participants=participants or []
        )
        
        return await self.get_chat_room(chat_room_id)
    
    async def get_chat_room(self, chat_room_id: str) -> Optional[ChatRoomSchema]:
        """
        Get chat room details with additional processing.
        
        Args:
            chat_room_id: ID of the chat room
            
        Returns:
            Optional[ChatRoomSchema]: Chat room details
        """
        chat_room = await self.chat_room_model.get_chat_room_by_id(chat_room_id)
        if not chat_room:
            return None
        
        # detailed participants list with user details
        detailed_participants_list = []
        for participant_id in chat_room.get('participants', []):
            user = await self.user_model.get_user_by_id(participant_id)
            if user:
                detailed_participants_list.append({
                    'id': user['id'],
                    'name': f"{user.get('first_name', '')} {user.get('last_name', '')}",
                    'email': user.get('email')
                })
        
        chat_room['participant_details'] = detailed_participants_list
        return ChatRoomSchema(**chat_room)
    
    async def send_message(self, text: str, sender_id: str, chat_room_id: str) -> ChatMessageSchema:
        """
        Send a message to a chat room.
        
        Args:
            text: Message text
            sender_id: ID of the sender
            chat_room_id: ID of the chat room
            
        Returns:
            ChatMessageSchema: Sent message
        """
        # Validate sender is in the chat room
        chat_room = await self.chat_room_model.get_chat_room_by_id(chat_room_id)
        if not chat_room or sender_id not in chat_room.get('participants', []):
            raise ValueError("Sender is not a participant in this chat room")
        
        # Create message
        message_id = await self.chat_message_model.create_message(
            text=text, 
            sender_id=sender_id, 
            chat_room_id=chat_room_id
        )
        
        # Get full message details
        message = await self.chat_message_model.get_message_by_id(message_id)
        
        # Detail with sender details
        sender = await self.user_model.get_user_by_id(sender_id)
        if sender:
            message['sender_name'] = f"{sender.get('first_name', '')} {sender.get('last_name', '')}"
        
        return ChatMessageSchema(**message)
    
    async def get_chat_room_messages(self, chat_room_id: str, limit: int = 50, 
                                     skip: int = 0) -> List[ChatMessageSchema]:
        """
        Get messages for a specific chat room with enriched details.
        
        Args:
            chat_room_id: ID of the chat room
            limit: Maximum number of messages to return
            skip: Number of messages to skip
            
        Returns:
            List[ChatMessageSchema]: List of messages
        """
        messages = await self.chat_message_model.get_chat_room_messages(
            chat_room_id, 
            limit=limit, 
            skip=skip
        )
        
        # Enrich messages with sender details
        enriched_messages = []
        for message in messages:
            sender = await self.user_model.get_user_by_id(message['sender_id'])
            if sender:
                message['sender_name'] = f"{sender.get('first_name', '')} {sender.get('last_name', '')}"
            enriched_messages.append(ChatMessageSchema(**message))
        
        return enriched_messages
    
    async def create_direct_chat(self, event_id: str, user1_id: str, user2_id: str) -> ChatRoomSchema:
        """
        Create or retrieve a direct chat between two users.
        
        Args:
            event_id: ID of the event
            user1_id: ID of the first user
            user2_id: ID of the second user
            
        Returns:
            ChatRoomSchema: Direct chat room
        """
        # Get or create direct chat room
        direct_chat = await self.chat_room_model.get_or_create_direct_chat(
            event_id, user1_id, user2_id
        )
        
        return await self.get_chat_room(direct_chat['id'])
    
    async def add_participant(self, chat_room_id: str, user_id: str) -> Optional[ChatRoomSchema]:
        """
        Add a participant to a chat room.
        
        Args:
            chat_room_id: ID of the chat room
            user_id: ID of the user to add
            
        Returns:
            Optional[ChatRoomSchema]: Updated chat room or None
        """
        result = await self.chat_room_model.add_participant(chat_room_id, user_id)
        if result:
            return await self.get_chat_room(chat_room_id)
        return None