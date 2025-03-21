from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class SessionSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    speaker_id: Optional[str] = None  # Reference to User
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = Field(default=None, max_length=255)
    capacity: int = Field(default=0, ge=0)  # 0 means unlimited
    session_type: str = Field(..., regex="^(presentation|workshop|panel|networking|breakout)$")
    materials: Optional[str] = None
    attendees_ids: List[str] = []  # List of User IDs

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        orm_mode = True
