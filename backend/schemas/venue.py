from pydantic import BaseModel, EmailStr, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, timezone

class VenueSchema(BaseModel):
    id: Optional[str] = None
    name: str
    address: str
    city: str
    state: Optional[str] = None
    country: str
    postal_code: Optional[str] = None

    # Venue details
    capacity: int
    website: Optional[HttpUrl] = None
    description: Optional[str] = None

    # Contact information
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None

    # Additional facilities
    has_wifi: bool = False
    has_parking: bool = False
    has_catering: bool = False

    # Images
    images: List[str] = Field(default_factory=list)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        orm_mode = True
