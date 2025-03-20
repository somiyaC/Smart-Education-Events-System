from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import tickets_collection

router = APIRouter()

class Ticket(BaseModel):
    event_id: str
    user_id: str
    price: float

@router.post("/")
def create_ticket(ticket: Ticket):
    ticket_dict = ticket.dict()
    ticket_id = tickets_collection.insert_one(ticket_dict).inserted_id
    return {"message": "Ticket created", "id": str(ticket_id)}

@router.get("/{ticket_id}")
def get_ticket(ticket_id: str):
    ticket = tickets_collection.find_one({"_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
