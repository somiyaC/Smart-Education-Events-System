from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Resource(BaseModel):
    id: str
    event_id: str
    session_id: Optional[str] = None
    uploader_id: str
    title: str
    description: Optional[str]
    file_url: str
    uploaded_at: datetime
    visibility: str  # public, private, registered-only
