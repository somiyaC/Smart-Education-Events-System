from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone

class TicketSchema(BaseModel):
    id: Optional[str] = None
    user_id: str  # Reference to User
    event_id: str  # Reference to Event
    purchase_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ticket_number: str
    qr_code: Optional[str] = None
    status: str = Field(default="active", regex="^(active|used|cancelled|refunded)$")
    checked_in: bool = False
    check_in_time: Optional[datetime] = None
    payment_reference: Optional[str] = None

    class Config:
        orm_mode = True
