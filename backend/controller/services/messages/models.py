from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    sender: str
    recipient: str
    content: str
    timestamp: datetime

class MessageCreate(BaseModel):
    sender: str
    recipient: str
    content: str

class MessageResponse(BaseModel):
    sender: str
    recipient: str
    content: str

class ChatHistoryResponse(BaseModel):
    messages: List[MessageResponse]
