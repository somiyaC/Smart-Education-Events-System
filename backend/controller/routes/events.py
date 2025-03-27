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

class SearchData(BaseModel):
    query: str

def document_to_dict(doc):
    if doc and '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

@router.get("/create_event")
async def create_event(event: Event):
    """
    Create an event users can sign up to.
    """
    event_data = event.dict()
    created_at = datetime.now()
    status = False  # you might want to handle event status properly
    event_id = await EventModel.create_event(
        event_data['name'],
        event_data['description'],
        event_data['event_type'],
        datetime.strptime(event_data['start_date'], "%Y-%m-%d"),
        datetime.strptime(event_data['end_date'], "%Y-%m-%d"),
        event_data['is_virtual'],
        event_data['virtual_meeting_url'],
        event_data['organizer'],
        event_data['venue'],
        event_data['capacity'],
        event_data['participants']
    )
    return {"event_id": event_id}

@router.post("/event_signup")
def create_event_signup(event_signup_data: EventSignupData):
    """
    Sign up for an event. This will create a ticket tied between the user_id and the event_id.
    """
    user_id = event_signup_data.user_id
    event_id = event_signup_data.event_id
    purchase_date = datetime.now()
    status = False
    # Example: Call ticket creation logic here
    return {"status": status}

@router.post("/event_cancel")
def event_cancel(event_cancel_data: EventUserData):
    """
    Allows users to cancel tickets for event participation.
    """
    user_id = event_cancel_data.user_id
    event_id = event_cancel_data.event_id
    status = False
    # Example: Call ticket cancellation logic here
    return {"status": status}

@router.get("/upcoming_events")
def get_upcoming_events(user_upcoming_event: EventUserData):
    """
    Fetch the user's tickets.
    """
    user_id = user_upcoming_event.user_id
    event_id = user_upcoming_event.event_id
    all_tickets = None  # Example: Fetch tickets from your ticket logic
    user_tickets = []
    if all_tickets:
        for ticket in all_tickets:
            if ticket.event_id == event_id and ticket.user_id == user_id:
                user_tickets.append(ticket)
    return {"tickets": user_tickets}

@router.get("/{event_id}")
def get_event(event_id: str):
    event = events_collection.find_one({"_id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.post("/event_search")
async def event_search(query: EventSearch):
    query_str = query.dict()['query']
    results = await EventModel.search_events(query=query_str)
    return {"events": [document_to_dict(event) for event in results] }

@router.post("/")
async def get_all_events(search: SearchData):
    query = search.query
    all_events = await EventModel.get_upcoming_events()
    matched_query = all_events
    if query != "":
        matched_query = []
        query_events = await EventModel.search_events(query=query)
        query_events_ids = [event['id'] for event in query_events]
        
        for event in all_events:
            if event['id'] in query_events_ids:
                matched_query.append(event)
    all_events = matched_query
    for event in all_events:
        organizer_id = event['organizer_id']
        try:
            user = await UserModel.get_user_by_id(organizer_id)
            if user is None:
                event['organizer'] = 'John Doe'
            else:
                event['organizer'] = user.first_name
        except Exception:
            event['organizer'] = "John Doe"

        venue_id = event['venue_id']
        try:
            venue = await VenueModel.get_venue_by_id(venue_id)
            event['venue'] = venue.name
        except Exception:
            event['venue'] = 'Mezzanine'

    return {"events": [document_to_dict(event) for event in all_events]}
