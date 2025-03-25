from typing import Dict, List, Optional
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
        if participants is None:
            participants = []

        chat_room_data = {
            "event_id": event_id,
            "name": name,
            "description": description,
            "is_private": is_private,
            "is_direct": is_direct,
            "participants": participants,
            "created_at": datetime.now(timezone.utc)
        }

        return await cls.insert_one(chat_room_data)

    @classmethod
    async def get_chat_room_by_id(cls, chat_room_id: str) -> Optional[Dict]:
        return await cls.find_one({"_id": ObjectId(chat_room_id)})

    @classmethod
    async def update_chat_room(cls, chat_room_id: str, update_data: Dict) -> Optional[Dict]:
        allowed_fields = ["name", "description", "is_private"]
        filtered_update = {k: v for k, v in update_data.items() if k in allowed_fields}

        return await cls.update_one(
            {"_id": ObjectId(chat_room_id)},
            {"$set": filtered_update}
        )

    @classmethod
    async def get_user_chat_rooms(cls, user_id: str, event_id: Optional[str] = None) -> List[Dict]:
        query = {"participants": user_id}
        if event_id:
            query["event_id"] = event_id
        return await cls.find_many(query)


class ChatMessageModel(BaseModel):
    """
    Model for chat message data operations.
    Handles all database interactions for chat messages.
    """
    collection_name = "chat_messages"

    @classmethod
    async def create_message(cls, text: str, sender_id: str, chat_room_id: str) -> str:
        """
        Create a new chat message and return its ID.
        """
        message_data = {
            "text": text,
            "sender_id": sender_id,
            "chat_room_id": chat_room_id,
            "created_at": datetime.now(timezone.utc)
        }

        return await cls.insert_one(message_data)

    @classmethod
    async def get_message_by_id(cls, message_id: str) -> Optional[Dict]:
        return await cls.find_one({"_id": ObjectId(message_id)})

    @classmethod
    async def get_chat_room_messages(cls, chat_room_id: str, limit: int = 50, skip: int = 0) -> List[Dict]:
        return await cls.find_many(
            {"chat_room_id": chat_room_id},
            limit=limit,
            skip=skip,
            sort=[("created_at", -1)]
        )

    @classmethod
    async def delete_message(cls, message_id: str) -> bool:
        """
        Deletes a message and returns True if successful.
        """
        return await cls.delete_one({"_id": ObjectId(message_id)})

    @classmethod
    async def update_message(cls, message_id: str, text: str) -> Optional[Dict]:
        return await cls.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"text": text}}
        )
