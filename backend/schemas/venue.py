from pydantic import BaseModel
from typing import Optional

class VenueSchema(BaseModel):
    id: Optional[str] = None
    name: str
    location: str
    capacity: int
    description: Optional[str] = None

    class Config:
        orm_mode = True
