from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import events_collection
from datetime import datetime

router = APIRouter()

class Event(BaseModel):
    name: str
    date: str
    location: str
    description: str
    organizer: str

@router.post("/create")
def create_event(event: Event):
    if events_collection.find_one({"name": event.name}):
        raise HTTPException(status_code=400, detail="Event already exists")

    events_collection.insert_one(event.dict())
    return {"message": "Event created successfully"}

@router.get("/list")
def list_events():
    return list(events_collection.find({}, {"_id": 0}))
