from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
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

@router.post("/resource_management/upload")
def upload_resource(resource: Resource):
    resource.id = str(uuid.uuid4())
    resource.uploaded_at = datetime.now()
    resources_db.append(resource)
    return {"status": True, "msg": "Resource uploaded", "resource_id": resource.id}

@router.get("/resource_management/{event_id}")
def get_resources(event_id: str):
    return [r for r in resources_db if r.event_id == event_id]
