from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection
import datetime

router = APIRouter()

class Event(BaseModel):
    name: str
    description: str
    start_date: str
    end_date: str
    organizer: str
    venue_id: str

class EventSignupData(BaseModel):
    user_id: str
    event_id: str
    ticket_type: str

class EventUserData(BaseModel):
    user_id: str
    event_id: str

@router.post("/create_event")
def create_event(event: Event):
    """
    create an event users cans sign up to
    """
    event_dict = event.dict()
    event_id = events_collection.insert_one(event_dict).inserted_id

    created_at = datetime.now()

    status = False
    # status = Events.create_event(...)

    return {"status":status}

@router.post("/event_signup")
def create_event(event_signup_data: EventSignupData):
    """
    signup for an event. This will create a ticket tied between the user_id and the event_id
    """
    user_id = event_signup_data.user_id
    event_id = event_signup_data.event_id

    purchase_date = datetime.now()

    status = False
    #status = Tickets.create_ticket()

    return {"status":status}

@router.post("/event_cancel")
def event_cancel(event_cancel_data: EventUserData):
    """
    allows users to cancel tickets for event participation
    """
    user_id = event_cancel_data.user_id
    event_id = event_cancel_data.event_id

    status = False
    #status = Tickets.cancel_signup(user_id, event_id)

    return {"status": status}

@router.get("/upcoming_events")
def get_upcoming_events(user_upcoming_event: EventUserData):
    """
    fetch the user's tickets
    """
    user_id = user_upcoming_event.user_id
    event_id = user_upcoming_event.event_id

    all_tickets = None
    user_tickets = []
    #all_tickets = Tickets.get_all()
    for ticket in all_tickets:
        if all_tickets.event_id == event_id and all_tickets.user_id == user_id:
            user_tickets.append(ticket)

    return {"ticketS":user_tickets}

@router.get("/{event_id}")
def get_event(event_id: str):
    event = events_collection.find_one({"_id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

