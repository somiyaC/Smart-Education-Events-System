from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, timezone

class UserSchema(BaseModel):
    id: Optional[str] = None  # MongoDB _id stored as string
    auth0_id: str
    email: EmailStr
    first_name: str
    last_name: str

     # User role
    role: str = Field(default="attendee", regex="^(attendee|stakeholder|organizer|admin)$")

    # Profile fields
    bio: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    phone: Optional[str] = None

    # Social Media Links
    linkedin: Optional[HttpUrl] = None
    twitter: Optional[HttpUrl] = None
    facebook: Optional[HttpUrl] = None

    # Preferences
    interests: List[str] = Field(default_factory=list)
    receive_notifications: bool = True

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        orm_mode = True
