from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class PollOptionSchema(BaseModel):
    text: str 
    votes: int = Field(default=0)

    class Config:
        orm_mode = True

class PollSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    session_id: Optional[str] = None  # Reference to Session
    created_by: str  # Reference to User
    question: str = Field(..., max_length=255)
    options: List[PollOptionSchema]  # List of poll options with vote counts
    is_multiple_choice: bool = False
    duration: int = 60  # Duration in seconds
    status: str = Field(..., regex="^(active|closed)$", default="active")
    voters: List[str] = []  # List of User IDs who voted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ends_at: datetime
    
    class Config:
        orm_mode = True
