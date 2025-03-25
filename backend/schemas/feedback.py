from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class FeedbackSchema(BaseModel):
    id: Optional[str] = None
    user_id: str  # Reference to User
    event_id: str  # Reference to Event
    session_id: Optional[str] = None  # Reference to Session
    rating: int = Field(..., ge=1, le=5)  # Scale 1-5
    comment: Optional[str] = None

    content_quality: Optional[int] = Field(None, ge=1, le=5)
    speaker_quality: Optional[int] = Field(None, ge=1, le=5)
    venue_quality: Optional[int] = Field(None, ge=1, le=5)
    organization_quality: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: bool = False
    improvement_suggestions: Optional[str] = None
    
    is_anonymous: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        orm_mode = True
