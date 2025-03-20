from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TicketSchema(BaseModel):
    id: Optional[str] = None
    event_id: str  # Reference to Event
    user_id: str  # Reference to User
    ticket_type: str  # e.g., "VIP", "Regular"
    purchase_date: datetime = datetime.utcnow()

    class Config:
        orm_mode = True
