from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection

router = APIRouter()

class Event(BaseModel):
    title: str
    description: str
    date: str
    location: str

@router.post("/")
def create_event(event: Event):
    event_dict = event.dict()
    event_id = events_collection.insert_one(event_dict).inserted_id
    return {"message": "Event created", "id": str(event_id)}

@router.get("/{event_id}")
def get_event(event_id: str):
    event = events_collection.find_one({"_id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
