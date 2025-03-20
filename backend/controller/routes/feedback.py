from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import feedback_collection

router = APIRouter()

class Feedback(BaseModel):
    event_id: str
    user_id: str
    rating: int
    comment: str

@router.post("/")
def create_feedback(feedback: Feedback):
    feedback_dict = feedback.dict()
    feedback_id = feedback_collection.insert_one(feedback_dict).inserted_id
    return {"message": "Feedback submitted", "id": str(feedback_id)}

@router.get("/{feedback_id}")
def get_feedback(feedback_id: str):
    feedback = feedback_collection.find_one({"_id": feedback_id})
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return feedback
