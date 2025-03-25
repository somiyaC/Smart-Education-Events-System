from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone

class QuestionSchema(BaseModel):
    id: Optional[str] = None
    session_id: str  # Reference to Session
    user_id: str  # Reference to User
    question_text: str
    is_anonymous: bool = False
    status: str = Field(default="pending", regex="^(pending|answered|dismissed)$")
    votes: int = Field(default=0)
    voters: List[str] = []  # List of User IDs who voted
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    answered_at: Optional[datetime] = None
    answer_text: Optional[str] = None
    
    class Config:
        orm_mode = True