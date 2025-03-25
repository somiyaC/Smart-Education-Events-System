from typing import Dict, List
from ..chat_model import ChatRoomModel, ChatMessageModel


class ChatMediator:
    """
    Mediator class to handle chat-related operations with additional logic and validation.
    """
    @classmethod
    async def create_chat_room(cls, event_id: str, name: str, description: str = "",
                                is_private: bool = False, is_direct: bool = False,
                                participants: List[str] = None) -> str:
        """
        Create a chat room with additional validation and business logic.
        
        Args:
            event_id: ID of the associated event
            name: Name of the chat room
            description: Optional description
            is_private: Whether the chat room is private
            is_direct: Whether it's a direct messaging room
            participants: Initial list of participants
        
        Returns:
            str: Created chat room ID
        
        Raises:
            ValueError: If room creation fails validation
        """
        
        # Limit number of participants for direct chats
        if is_direct and participants and len(participants) > 2:
            raise ValueError("Direct chat can only have 2 participants")
        
        return await ChatRoomModel.create_chat_room(
            event_id, name, description, is_private, is_direct, participants
        )

    @classmethod
    async def send_message(cls, text: str, sender_id: str, chat_room_id: str) -> str:
        """
        Send a message with additional validation and business logic.
        
        Args:
            text: Message text
            sender_id: ID of the sender
            chat_room_id: ID of the chat room
        
        Returns:
            str: Created message ID
        
        Raises:
            ValueError: If message sending fails validation
        """
        # Validate message
        if not text or len(text.strip()) == 0:
            raise ValueError("Message cannot be empty")
        
        # Check if sender is in the chat room
        chat_room = await ChatRoomModel.get_chat_room_by_id(chat_room_id)
        if not chat_room:
            raise ValueError("Chat room does not exist")
        
        if sender_id not in chat_room.get('participants', []):
            raise ValueError("User is not a participant in this chat room")
        
        # Create and return the message ID
        return await ChatMessageModel.create_message(text, sender_id, chat_room_id)


    
    @classmethod
    async def get_messages(cls, chat_room_id: str, limit: int = 50) -> List[Dict]:
        """
        Get messages with additional validation.
        
        Args:
            chat_room_id: ID of the chat room
            limit: Maximum number of messages to retrieve
        
        Returns:
            List of message dictionaries
        
        Raises:
            ValueError: If chat room does not exist
        """
        # Validate chat room exists
        chat_room = await ChatRoomModel.get_chat_room_by_id(chat_room_id)
        if not chat_room:
            raise ValueError("Chat room does not exist")
        
        # Validate and potentially modify limit
        limit = max(1, min(limit, 100)) 
        
        return await ChatMessageModel.get_chat_room_messages(chat_room_id, limit)