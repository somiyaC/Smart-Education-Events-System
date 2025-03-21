from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime,timezone

class EventSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    event_type: str 
    start_date: datetime
    end_date: datetime
    is_virtual: bool = False
    virtual_meeting_url: str
    organizer_id: str  # Reference to User (user_id)
    venue_id: str  # Reference to Venue (venue_id)
    participants: List[str] = []  # List of User IDs

    capacity: int

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        orm_mode = True
