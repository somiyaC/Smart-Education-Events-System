from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from controller.database import get_db
from models.ticket_model import TicketModel  # Import the TicketModel class

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# ----- Pydantic Schemas for Ticket Data -----

class TicketCreate(BaseModel):
    event_id: str
    attendee_id: str
    price: float
    status: str  # e.g., "unpaid", "paid", "cancelled"
    payment_reference: Optional[str] = None

class TicketUpdate(BaseModel):
    event_id: Optional[str] = None
    attendee_id: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    payment_reference: Optional[str] = None

# ----- Ticket Endpoints -----

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_ticket_endpoint(ticket: TicketCreate, db=Depends(get_db)):
    new_ticket_id = await TicketModel.create_ticket(ticket.attendee_id, ticket.event_id, ticket.payment_reference)
    if not new_ticket_id:
        raise HTTPException(status_code=400, detail="Ticket creation failed")
    return {"id": str(new_ticket_id)}

@router.get("/{ticket_id}")
async def get_ticket_endpoint(ticket_id: str, db=Depends(get_db)):
    ticket = await TicketModel.get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}")
async def update_ticket_endpoint(ticket_id: str, ticket_update: TicketUpdate, db=Depends(get_db)):
    update_data = ticket_update.dict(exclude_unset=True)
    updated_ticket = await TicketModel.update_ticket(db, ticket_id, update_data)
    # If update returns None, try fetching the ticket.
    if updated_ticket is None:
        updated_ticket = await TicketModel.get_ticket_by_id(ticket_id)
        if updated_ticket is None:
            raise HTTPException(status_code=404, detail="Ticket not found")
    return updated_ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ticket_endpoint(ticket_id: str, db=Depends(get_db)):
    deleted_count = await TicketModel.delete_ticket(db, ticket_id)
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return
