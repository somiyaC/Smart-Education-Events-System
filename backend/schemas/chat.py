from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ChatMessageSchema(BaseModel):
    id: Optional[str] = None
    text: str
    sender_id: str  # Reference to User
    chat_room_id: str  # Reference to ChatRoom
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True

class ChatRoomSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    name: str
    is_private: bool = False
    participants: List[str] = []  # List of User IDs
    messages: List[str] = []  # List of ChatMessage IDs
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
