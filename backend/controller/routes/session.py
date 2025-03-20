from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import sessions_collection

router = APIRouter()

class Session(BaseModel):
    event_id: str
    title: str
    speaker: str
    time: str

@router.post("/")
def create_session(session: Session):
    session_dict = session.dict()
    session_id = sessions_collection.insert_one(session_dict).inserted_id
    return {"message": "Session created", "id": str(session_id)}

@router.get("/{session_id}")
def get_session(session_id: str):
    session = sessions_collection.find_one({"_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
