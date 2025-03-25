from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

class EmailTrackingSchema(BaseModel):
    user_id: str  # Reference to User
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    opened: bool = False
    opened_at: Optional[datetime] = None
    clicked: bool = False
    clicked_at: Optional[datetime] = None
    clicks: List[Dict[str, Any]] = []
    
    class Config:
        orm_mode = True

class EmailMetricsSchema(BaseModel):
    total_sent: int = 0
    opened: int = 0
    clicked: int = 0
    bounced: int = 0
    
    class Config:
        orm_mode = True

class EmailCampaignSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    name: str
    subject: str
    body_html: str
    body_text: str
    audience: Dict[str, Any]
    sender_name: str
    sender_email: EmailStr
    status: str = Field(default="draft", regex="^(draft|scheduled|sent|cancelled)$")
    schedule_time: Optional[datetime] = None
    sent_time: Optional[datetime] = None
    metrics: EmailMetricsSchema = Field(default_factory=EmailMetricsSchema)
    tracking: List[EmailTrackingSchema] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    class Config:
        orm_mode = True