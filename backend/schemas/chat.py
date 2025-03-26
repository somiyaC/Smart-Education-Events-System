from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

class ChatMessageSchema(BaseModel):
    id: Optional[str] = None
    text: str
    sender_id: str  # Reference to User
    chat_room_id: str  # Reference to ChatRoom
    created_at: datetime = datetime.now(timezone.utc) 
    
    class Config:
        orm_mode = True

class ChatRoomSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    name: str
    description: Optional[str] = ""  
    is_private: bool = False
    is_direct: bool = False  # New field
    participants: List[str] = []  # List of User IDs
    messages: List[ChatMessageSchema] = []  # List of ChatMessage objects
    created_at: datetime = datetime.now(timezone.utc)


    class Config:
        orm_mode = True
