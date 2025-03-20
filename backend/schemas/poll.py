from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PollSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    question: str
    options: List[str]  # ["Option A", "Option B", ...]
    votes: List[int] = []  # Tracks votes for each option
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
