from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models.session_model import SessionModel
from models.event_model import EventModel
from controller.services.materials.database import get_materials_by_event
import uuid

router = APIRouter()

class Resource(BaseModel):
    id: str
    event_id: str
    session_id: Optional[str] = None
    uploader_id: str
    title: str
    description: Optional[str]
    file_url: str
    uploaded_at: datetime
    visibility: str  # "public", "private", "registered-only"

# In-memory "database"
resources_db: List[Resource] = []

@router.get("/speaker/{userId}")
async def get_speaker(userId: str):
    sessions = await SessionModel.get_speaker_sessions(userId)
    event_ids = set()
    print(sessions)
    for session in sessions:
        if session['event_id']:
            event_ids.add(session['event_id']+"")
    events = []
    for id in event_ids:
        event = await EventModel.get_event_by_id(id)
        events.append(event)
    for event in events:
        materials = get_materials_by_event(event["id"])
        sess = await SessionModel.get_event_sessions(event['id'])
        for idx, sessi in enumerate(sess):
            sessi['materials'] = materials
        event['sessions'] = sess
            

    return {"events":events}

@router.post("/resources/upload")
def upload_resource(resource: Resource):
    resource.id = str(uuid.uuid4())
    resource.uploaded_at = datetime.now()
    resources_db.append(resource)
    return {"status": True, "msg": "Resource uploaded", "resource_id": resource.id}

@router.get("/resources/{event_id}")
def get_resources(event_id: str):
    return [r for r in resources_db if r.event_id == event_id]
