from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import polls_collection
from bson import ObjectId

router = APIRouter()

class Poll(BaseModel):
    question: str
    options: list[dict]
    created_by: str
    status: bool
    answers: list
    total_count: int

class PollAnswerData(BaseModel):
    user_id: str
    answer: str
    poll_id: str

@router.post("/")
def create_poll(poll: Poll):
    poll_dict = poll.dict()
    poll_dict['answers'] = []
    for option in poll_dict['options']:
        option['stat'] = 0
        option['count'] = 0
    poll_id = polls_collection.insert_one(poll_dict).inserted_id
    return {"message": "Poll created", "id": str(poll_id)}

@router.get("/")
def get_polls():
    polls = []
    for poll in polls_collection.find():
        poll["id"] = str(poll["_id"])  # Convert ObjectId to string
        del poll['_id']
        polls.append(poll)
    return {"polls": polls}

@router.post("/answer")
def answer_poll(pollData: PollAnswerData):
    pollData = pollData.dict()
    user_id = pollData['user_id']
    answer = pollData['answer']
    new_answer = {"user_id": user_id, "answer": answer}
    
    poll = polls_collection.find_one({"_id": ObjectId(pollData["poll_id"])})
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    total_count = poll['total_count'] + 1  # Increment the total count
    
    # Update the counts and stats for options
    for option in poll['options']:
        if option['text'] == answer:
            option['count'] += 1
        option['stat'] = (option['count'] / total_count) * 100  # Update stat for all options
    
    # Prepare the update data in one $set operation
    update_data = {
        "$push": {"answers": new_answer},  # Add the new answer to the answers array
        "$set": {
            "total_count": total_count,  # Update the total count
            "options": poll['options']  # Update the options array with new counts and stats
        }
    }

    # Update the poll in the database
    polls_collection.update_one(
        {"_id": ObjectId(pollData['poll_id'])},
        update_data
    )
    
    return {"status": "ok"}



@router.get("/{poll_id}")
def get_poll(poll_id: str):
    poll = polls_collection.find_one({"_id": poll_id})
    if not poll:
        raise HTTPException(satus_code=404, detail="Poll not found")
    return poll
