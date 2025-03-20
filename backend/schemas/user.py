from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserSchema(BaseModel):
    id: Optional[str] = None  # MongoDB _id stored as string
    email: EmailStr
    full_name: str
    password: str  # Hashed password
    role: str = "attendee"  # Default role
    created_at: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
