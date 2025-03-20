from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EventSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    organizer: str  # Reference to User (user_id)
    venue_id: str  # Reference to Venue (venue_id)
    participants: List[str] = []  # List of User IDs
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
