from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection
from datetime import datetime
from models.event_model import EventModel
from models.user_model import UserModel
from models.venue_model import VenueModel
from models.session_model import SessionModel
from typing import Dict, List, Optional, Any
from controller.services.materials.database import get_materials_by_event
router = APIRouter()

class Session(BaseModel):
    title: str
    description: str
    speaker: str
    speaker_id: str
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

class SessionsUpdate(BaseModel):
    sessions: List[Session]

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

    for event in organizer_events:
        idx = 0
        for participant_id in event['participants']:
            user = await UserModel.get_user_by_id(participant_id)
            if idx == 0:
                event['participants_email'] = [user['email']]
                idx = 1
                continue
            event['participants_email'].append(user['email'])
    
    return {"events":organizer_events}

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
            materials = get_materials_by_event(event["id"])
            print(event['id'])
            print(materials)
            for idx, session in enumerate(event['sessions']):
                event['sessions'][idx]['materials'] = materials
            user_events.append(event)
    
    return {"events":[document_to_dict(event) for event in user_events] }    

@router.post("/create_event")
async def create_event(event: Event):
    """
    create an event users cans sign up to
    """
    sessions = event.sessions
    event = event.dict()
    
    # Remove id field if present (for creation)
    event.pop('id', None)

    event_id = await EventModel.create_event(event['name'], event['description'], event['event_type'], datetime.strptime(event['start_date'], "%Y-%m-%d"),datetime.strptime(event['end_date'],"%Y-%m-%d"),event['is_virtual'],event['virtual_meeting_url'],event['organizer'],event['venue'],event['capacity'],event['participants'])

    for session in sessions:
        session_dict = session.dict()
        # Remove id field if present (for creation)
        print(session_dict)
        session_dict.pop('id', None)
        await SessionModel.create_session(event_id, session_dict['title'],session_dict['startTime'],session_dict['endTime'], session_dict.get('session_type', 'Conference'),session_dict['description'],session_dict['speaker_id'],"Mezzanine",event['capacity'],"Laptop",event['participants'])

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
async def get_event(event_id: str):
    event = await EventModel.get_event_by_id(event_id)
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

# ROUTES FOR EDITING EVENTS

@router.put("/update_event/{event_id}")
async def update_event(event_id: str, event: Event):
    """
    Update an existing event details.
    Receives event_id as a URL parameter instead of in the body.
    """
    try:
        # Extract event data
        event_dict = event.dict()
        
        # Remove sessions - they will be updated separately
        event_dict.pop("sessions", None)
        
        # Check if event exists
        existing_event = await EventModel.get_event_by_id(event_id)
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Convert string dates to datetime objects for database
        if "start_date" in event_dict:
            try:
                event_dict["start_date"] = datetime.strptime(event_dict["start_date"], "%Y-%m-%d")
            except ValueError:
                # If date is already in a different format, keep it as is
                pass
                
        if "end_date" in event_dict:
            try:
                event_dict["end_date"] = datetime.strptime(event_dict["end_date"], "%Y-%m-%d")
            except ValueError:
                # If date is already in a different format, keep it as is
                pass
        
        # Update event details
        updated_event = await EventModel.update_event(event_id, event_dict)
        
        return {
            "status": "success",
            "message": "Event updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update event: {str(e)}")

@router.put("/sessions/update_sessions/{event_id}")
async def update_event_sessions(event_id: str, data: SessionsUpdate):
    """
    Update sessions for an event.
    Creates new sessions, updates existing ones, and removes deleted ones.
    Matches the frontend's payload format of { sessions: [...] }
    """
    try:
        # Check if event exists
        existing_event = await EventModel.get_event_by_id(event_id)
        if not existing_event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get existing sessions for this event
        existing_sessions = await SessionModel.get_event_sessions(event_id)
        existing_session_ids = {s.get("id"): s for s in existing_sessions if s.get("id")}
        
        updated_sessions = []
        retained_session_ids = set()
        
        # Process each session
        for session in data.sessions:
            session_dict = session.dict()
            session_id = session_dict.pop("id", None)
            
            # Prepare session data for database
            session_data = {
                "title": session_dict.get("title"),
                "description": session_dict.get("description", ""),
                "start_time": session_dict.get("startTime"),
                "end_time": session_dict.get("endTime"),
                "session_type": "Conference",  # Default value
                "materials": ", ".join(session_dict.get("materials", [])),
            }
            
            # Update existing session or create new one
            if session_id and session_id in existing_session_ids:
                # Update existing session
                updated_session = await SessionModel.update_session(session_id, session_data)
                updated_sessions.append(updated_session)
                retained_session_ids.add(session_id)
            else:
                # Create new session
                new_session_id = await SessionModel.create_session(
                    event_id=event_id,
                    title=session_data["title"],
                    start_time=session_data["start_time"],
                    end_time=session_data["end_time"],
                    session_type=session_data["session_type"],
                    description=session_data["description"],
                    speaker_id=None,
                    location="Mezzanine",  # Default value
                    capacity=existing_event.get("capacity", 100),  # Use event capacity
                    materials=session_data["materials"],
                    attendees_ids=existing_event.get("participants", [])  # Use event participants
                )
                if new_session_id:
                    new_session = await SessionModel.get_session_by_id(new_session_id)
                    updated_sessions.append(new_session)
        
        # Delete sessions that weren't included in the update
        sessions_to_delete = set(existing_session_ids.keys()) - retained_session_ids
        for session_id in sessions_to_delete:
            await SessionModel.delete_session(session_id)
        
        return {
            "status": "success", 
            "message": f"Updated {len(updated_sessions)} sessions, deleted {len(sessions_to_delete)} sessions"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update sessions: {str(e)}")
        
@router.get("/sessions/event/{event_id}")
async def get_event_sessions(event_id: str):
    """
    Get all sessions for a specific event.
    """
    try:
        # Check if event exists
        event = await EventModel.get_event_by_id(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get sessions for this event
        sessions = await SessionModel.get_event_sessions(event_id)
        
        # Format sessions to match frontend expectations
        formatted_sessions = []
        for session in sessions:
            # Format materials
            materials = []
            if "materials" in session and session["materials"]:
                if isinstance(session["materials"], str):
                    materials = [m.strip() for m in session["materials"].split(",") if m.strip()]
                elif isinstance(session["materials"], list):
                    materials = session["materials"]
            
            formatted_session = {
                "id": session.get("id"),
                "title": session.get("title", ""),
                "description": session.get("description", ""),
                "speaker": session.get("speaker", ""),
                "speaker_id": session.get("speaker_id", ""),
                "start_time": session.get("start_time", ""),
                "end_time": session.get("end_time", ""),
                "materials": materials
            }
            formatted_sessions.append(formatted_session)
        
        return {"sessions": formatted_sessions}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")