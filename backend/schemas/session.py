from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SessionSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    speaker_id: str  # Reference to User
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    attendees: List[str] = []  # List of User IDs

    class Config:
        orm_mode = True
