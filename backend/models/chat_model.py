"""
Chat model module for handling chat rooms and messages.
Supports event-specific discussion boards and direct messaging.
Based on the ChatRoomSchema and ChatMessageSchema.
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone
from bson import ObjectId

from .base_model import BaseModel


class ChatRoomModel(BaseModel):
    """
    Model for chat room data operations.
    Handles all database interactions for chat rooms.
    """
    collection_name = "chat_rooms"
    
    @classmethod
    async def create_chat_room(cls, event_id: str, name: str, description: str = "", 
                            is_private: bool = False, is_direct: bool = False, 
                            participants: List[str] = None) -> str:
        """
        Create a new chat room for an event.
        
        Args:
            event_id: ID of the event this chat room belongs to
            name: Name of the chat room
            description: Description of the chat room
            is_private: Whether this is a private chat room
            is_direct: Whether this is a direct messaging chat room
            participants: List of user IDs participating in the chat room
            
        Returns:
            str: ID of the created chat room
        """
        if participants is None:
            participants = []
            
        chat_room_data = {
            "event_id": event_id,
            "name": name,
            "description": description,
            "is_private": is_private,
            "is_direct": is_direct,
            "participants": participants,
            "messages": [],
            "created_at": datetime.now(timezone.utc)
        }
        
        chat_room_id = await cls.insert_one(chat_room_data)
        return str(chat_room_id)
    
    @classmethod
    async def get_chat_room_by_id(cls, chat_room_id: str) -> Dict:
        """
        Get chat room details by ID.
        
        Args:
            chat_room_id: Chat room ID
            
        Returns:
            Dict: Chat room document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(chat_room_id)})
    
    @classmethod
    async def get_event_chat_rooms(cls, event_id: str, is_private: bool = False, 
                                  is_direct: bool = False) -> List[Dict]:
        """
        Get all chat rooms for a specific event.
        
        Args:
            event_id: Event ID
            is_private: Whether to return private chat rooms
            is_direct: Whether to return direct message rooms
            
        Returns:
            List[Dict]: List of chat room documents
        """
        return await cls.find_many({
            "event_id": event_id,
            "is_private": is_private,
            "is_direct": is_direct
        })
    
    @classmethod
    async def get_or_create_direct_chat(cls, event_id: str, user1_id: str, user2_id: str) -> Dict:
        """
        Get or create a direct chat room between two users.
        
        Args:
            event_id: Event ID
            user1_id: First user's ID
            user2_id: Second user's ID
            
        Returns:
            Dict: Direct chat room document
        """
        # Check if a direct chat already exists
        direct_chat = await cls.find_one({
            "event_id": event_id,
            "is_direct": True,
            "participants": {"$all": [user1_id, user2_id]},
            "participants": {"$size": 2}
        })
        
        if direct_chat:
            return direct_chat
            
        # Create a new direct chat room
        chat_room_id = await cls.create_chat_room(
            event_id=event_id,
            name=f"Direct Chat",
            description="Private conversation",
            is_private=True,
            is_direct=True,
            participants=[user1_id, user2_id]
        )
        
        return await cls.get_chat_room_by_id(chat_room_id)
    
    @classmethod
    async def get_user_chat_rooms(cls, user_id: str, event_id: Optional[str] = None) -> List[Dict]:
        """
        Get all chat rooms a user is participating in.
        
        Args:
            user_id: User ID
            event_id: Optional event ID filter
            
        Returns:
            List[Dict]: List of chat room documents
        """
        query = {"participants": user_id}
        if event_id:
            query["event_id"] = event_id
            
        return await cls.find_many(query)
    
    @classmethod
    async def add_participant(cls, chat_room_id: str, user_id: str) -> Optional[Dict]:
        """
        Add a participant to a chat room.
        
        Args:
            chat_room_id: Chat room ID
            user_id: User ID to add
            
        Returns:
            Dict: Updated chat room document or None if not found
        """
        chat_room = await cls.get_chat_room_by_id(chat_room_id)
        if not chat_room:
            return None
            
        # Don't add if it's a direct chat and already has two participants
        if chat_room.get("is_direct", False) and len(chat_room.get("participants", [])) >= 2:
            return None
            
        return await cls.update_one(
            {"_id": ObjectId(chat_room_id)},
            {"$addToSet": {"participants": user_id}}
        )
    
    @classmethod
    async def remove_participant(cls, chat_room_id: str, user_id: str) -> Optional[Dict]:
        """
        Remove a participant from a chat room.
        
        Args:
            chat_room_id: Chat room ID
            user_id: User ID to remove
            
        Returns:
            Dict: Updated chat room document or None if not found
        """
        return await cls.update_one(
            {"_id": ObjectId(chat_room_id)},
            {"$pull": {"participants": user_id}}
        )
    
    @classmethod
    async def update_chat_room(cls, chat_room_id: str, update_data: Dict) -> Optional[Dict]:
        """
        Update chat room information.
        
        Args:
            chat_room_id: Chat room ID
            update_data: Dictionary containing fields to update
            
        Returns:
            Dict: Updated chat room document or None if not found
        """
        # Ensure we only update allowed fields
        allowed_fields = ["name", "description", "is_private"]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}
        
        return await cls.update_one(
            {"_id": ObjectId(chat_room_id)},
            {"$set": filtered_update}
        )


class ChatMessageModel(BaseModel):
    """
    Model for chat message data operations.
    Handles all database interactions for chat messages.
    """
    collection_name = "chat_messages"
    
    @classmethod
    async def create_message(cls, text: str, sender_id: str, chat_room_id: str) -> str:
        """
        Create a new chat message.
        
        Args:
            text: Message text
            sender_id: ID of the user sending the message
            chat_room_id: ID of the chat room
            
        Returns:
            str: ID of the created message
        """
        message_data = {
            "text": text,
            "sender_id": sender_id,
            "chat_room_id": chat_room_id,
            "created_at": datetime.now(timezone.utc)
        }
        
        message_id = await cls.insert_one(message_data)
        message_data["id"] = str(message_id)
        
        # Also add message to the chat room's messages array
        await ChatRoomModel.update_one(
            {"_id": ObjectId(chat_room_id)},
            {"$push": {"messages": message_data}}
        )
        
        return str(message_id)
    
    @classmethod
    async def get_message_by_id(cls, message_id: str) -> Dict:
        """
        Get message details by ID.
        
        Args:
            message_id: Message ID
            
        Returns:
            Dict: Message document or None if not found
        """
        return await cls.find_one({"_id": ObjectId(message_id)})
    
    @classmethod
    async def get_chat_room_messages(cls, chat_room_id: str, limit: int = 50, 
                                   skip: int = 0, sort_direction: int = -1) -> List[Dict]:
        """
        Get messages for a specific chat room with pagination.
        
        Args:
            chat_room_id: Chat room ID
            limit: Maximum number of messages to return
            skip: Number of messages to skip
            sort_direction: Sort direction (-1 for newest first, 1 for oldest first)
            
        Returns:
            List[Dict]: List of message documents
        """
        return await cls.find_many(
            {"chat_room_id": chat_room_id},
            limit=limit,
            skip=skip,
            sort=[("created_at", sort_direction)]
        )
    
    @classmethod
    async def delete_message(cls, message_id: str) -> bool:
        """
        Delete a chat message.
        
        Args:
            message_id: Message ID
            
        Returns:
            bool: True if deleted, False otherwise
        """
        message = await cls.get_message_by_id(message_id)
        if not message:
            return False
            
        # Remove from messages collection
        deleted_count = await cls.delete_one({"_id": ObjectId(message_id)})
        
        # Also remove from chat room's messages array
        await ChatRoomModel.update_one(
            {"_id": ObjectId(message["chat_room_id"])},
            {"$pull": {"messages": {"id": str(message_id)}}}
        )
        
        return deleted_count > 0
    
    @classmethod
    async def update_message(cls, message_id: str, text: str) -> Optional[Dict]:
        """
        Update a message's text.
        
        Args:
            message_id: Message ID
            text: New message text
            
        Returns:
            Dict: Updated message document or None if not found
        """
        message = await cls.get_message_by_id(message_id)
        if not message:
            return None
            
        # Update in the messages collection
        updated_message = await cls.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"text": text}}
        )
        
        # Also update in the chat room's messages array
        await ChatRoomModel.update_one(
            {"_id": ObjectId(message["chat_room_id"]), "messages.id": str(message_id)},
            {"$set": {"messages.$.text": text}}
        )
        
        return updated_message
    
    @classmethod
    async def create_thread(cls, chat_room_id: str, parent_message_id: str, 
                        text: str, sender_id: str) -> Dict:
        """
        Create a threaded reply to a message.
        
        Args:
            chat_room_id: ID of the chat room
            parent_message_id: ID of the parent message
            text: Message text
            sender_id: ID of the user sending the message
            
        Returns:
            Dict: Created thread message document
        """
        # Create the reply message
        message_id = await cls.create_message(text, sender_id, chat_room_id)
        
        # Get the created message
        message = await cls.get_message_by_id(message_id)
        
        # Add a reference to the parent message
        updated_message = await cls.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"parent_message_id": parent_message_id}}
        )
        
        # Add this message to the parent's thread list
        await cls.update_one(
            {"_id": ObjectId(parent_message_id)},
            {"$push": {"thread_messages": message}}
        )
        
        return updated_message