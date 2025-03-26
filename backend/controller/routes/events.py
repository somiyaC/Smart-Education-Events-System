from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection
from datetime import datetime
from models.event_model import EventModel
from models.user_model import UserModel
from models.venue_model import VenueModel
from typing import Dict, List, Optional, Any
router = APIRouter()

class Event(BaseModel):
    name: str
    description: str
    start_date: str
    event_type: str
    end_date: str
    organizer: str
    venue: str
    is_virtual: bool
    virtual_meeting_url: str
    participants: List[str]
    capacity: int

class EventSignupData(BaseModel):
    user_id: str
    event_id: str
    ticket_type: str

class EventUserData(BaseModel):
    user_id: str
    event_id: str

class EventSearch(BaseModel):
    query: str

def document_to_dict(doc):
    if doc and '_id' in doc.keys():
        doc['_id'] = str(doc['_id'])
    return doc


@router.post("/create_event")
async def create_event(event: Event):
    """
    create an event users cans sign up to
    """
    event = event.dict()

    event_id = await EventModel.create_event(event['name'], event['description'], event['event_type'], datetime.strptime(event['start_date'], "%Y-%m-%d"),datetime.strptime(event['end_date'],"%Y-%m-%d"),event['is_virtual'],event['virtual_meeting_url'],event['organizer'],event['venue'],event['capacity'],event['participants'])
    return {"event_id":event_id}

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

    return {"tickets":user_tickets}

@router.get("/{event_id}")
def get_event(event_id: str):
    event = events_collection.find_one({"_id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/event_search")
async def event_search(query: EventSearch):
    query = query.dict()['query']
    results = await EventModel.search_events(query=query)
    return {"events":[document_to_dict(event) for event in results] }


@router.get("/")
async def get_all_events():
    all_events = await EventModel.get_upcoming_events()
    print("aall")
    print(all_events)

    for event in all_events:
        organizer_id = event['organizer_id']
        try:
            user = await UserModel.get_user_by_id(organizer_id)
            if user is None:
                event['organizer'] = 'John Doe'
            else:
                event['organizer'] = user.first_name
        except:
            event['organizer'] = "John Doe"

        venue_id = event['venue_id']
        try:
            venue = await VenueModel.get_venue_by_id(venue_id)
            event['venue'] = venue.name
        except:
            event['venue'] = 'Mezzanine'

    return {"events":[document_to_dict(event) for event in all_events] }