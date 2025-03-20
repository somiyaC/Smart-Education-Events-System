from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import polls_collection

router = APIRouter()

class Poll(BaseModel):
    event_id: str
    question: str
    options: list[str]

@router.post("/")
def create_poll(poll: Poll):
    poll_dict = poll.dict()
    poll_id = polls_collection.insert_one(poll_dict).inserted_id
    return {"message": "Poll created", "id": str(poll_id)}

@router.get("/{poll_id}")
def get_poll(poll_id: str):
    poll = polls_collection.find_one({"_id": poll_id})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll
