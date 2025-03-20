from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FeedbackSchema(BaseModel):
    id: Optional[str] = None
    user_id: str  # Reference to User
    event_id: str  # Reference to Event
    rating: int  # Scale 1-5
    comment: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
