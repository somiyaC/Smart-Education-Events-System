from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection
from datetime import datetime
from models.event_model import EventModel
from models.user_model import UserModel
from models.venue_model import VenueModel
from models.session_model import SessionModel
from typing import Dict, List, Optional, Any
router = APIRouter()

class Session(BaseModel):
    title: str
    description: str
    speaker: str
    startTime: str
    endTime: str
    materials: List[str]
    

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
    sessions: List[Session]

class SearchData(BaseModel):
    query: Optional[str]

class EventSignupData(BaseModel):
    user_id: str
    event_id: str

class EventUserData(BaseModel):
    user_id: str
    event_id: str

class UserData(BaseModel):
    user_id: str

class EventSearch(BaseModel):
    query: str

class OrganizerData(BaseModel):
    organizer_id: str

def document_to_dict(doc):
    if doc and '_id' in doc.keys():
        doc['_id'] = str(doc['_id'])
    return doc

@router.post("/organizer_event")
async def organizer_event(org_data: OrganizerData):
    organizer_id = org_data.organizer_id
    all_events = await EventModel.get_upcoming_events()
    organizer_events = []
    for event in all_events:
        if organizer_id == event['organizer_id']:
            organizer_events.append(event)

    idx = 0
    for event in organizer_events:
        for participant_id in event['participants']:
            user = await UserModel.get_user_by_id(participant_id)
            if idx == 0:
                event['participants_email'] = [user['email']]
                idx = 1
                continue
            event['participants_email'].append(user['email'])
    
    return organizer_events

    

@router.post("/user_events")
async def user_events(user_data: UserData):
    user_id = user_data.user_id
    all_events = await EventModel.get_upcoming_events()
    user_events = []
    for event in all_events:
        if user_id in event['participants']:
            print(event)
            sessions = await SessionModel.get_event_sessions(event['id'])            
            cleaned_sessions = [document_to_dict(session) for session in sessions]
            event['sessions'] = cleaned_sessions
            user_events.append(event)
    
    return {"events":[document_to_dict(event) for event in user_events] }    


@router.post("/create_event")
async def create_event(event: Event):
    """
    create an event users cans sign up to
    """
    sessions = event.sessions
    event = event.dict()


    event_id = await EventModel.create_event(event['name'], event['description'], event['event_type'], datetime.strptime(event['start_date'], "%Y-%m-%d"),datetime.strptime(event['end_date'],"%Y-%m-%d"),event['is_virtual'],event['virtual_meeting_url'],event['organizer'],event['venue'],event['capacity'],event['participants'])

    for session in sessions:
        session = session.dict()
        await SessionModel.create_session(event_id, session['title'],session['startTime'],session['endTime'],"Conference",session['description'],None,"Mezzanine",event['capacity'],"Laptop",event['participants'])

    return {"event_id":event_id}


@router.post("/event_signup")
async def create_event(event_signup_data: EventSignupData):
    """
    signup for an event. This will create a ticket tied between the user_id and the event_id
    """
    user_id = event_signup_data.user_id
    event_id = event_signup_data.event_id

    event = await EventModel.get_event_by_id(event_id)

    print("event", event)

    try:
        await EventModel.add_participant(event_id, user_id)
    except:
        return {"status":False}

    return {"status":True}

@router.post("/event_cancel")
async def event_cancel(event_cancel_data: EventUserData):
    """
    allows users to cancel tickets for event participation
    """
    user_id = event_cancel_data.user_id
    event_id = event_cancel_data.event_id

    event = await EventModel.get_event_by_id(event_id)

    if event is None:
        print("failed")
        return {"status": False}
    print("removing participant")
    result = await EventModel.remove_participant(event_id,user_id)
    
    return {"status": result}

@router.get("/upcoming_events")
async def get_upcoming_events(user_upcoming_event: EventUserData):
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