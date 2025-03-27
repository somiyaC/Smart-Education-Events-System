from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timezone
from controller.database import get_db
from models.poll_model import PollModel
from models.chat_model import ChatRoomModel, ChatMessageModel
from models.feedback_model import FeedbackModel

router = APIRouter(prefix="/engagement", tags=["Networking & Engagement"])

# --------------------- Polling Endpoints ---------------------
class PollCreate(BaseModel):
    event_id: str
    created_by: str
    question: str
    options: List[Dict]
    is_multiple_choice: Optional[bool] = False
    duration: Optional[int] = 60
    session_id: Optional[str] = None

class PollVote(BaseModel):
    user_id: str
    option_indices: List[int]


@router.post("/polls", status_code=status.HTTP_201_CREATED)
async def create_poll_endpoint(poll: PollCreate, db=Depends(get_db)):
    poll_id = await PollModel.create_poll(
        poll.event_id, 
        poll.created_by, 
        poll.question, 
        poll.options, 
        poll.is_multiple_choice, 
        poll.duration, 
        poll.session_id
    )
    if not poll_id:
        raise HTTPException(status_code=400, detail="Failed to create poll")
    return {"poll_id": str(poll_id)}

@router.post("/polls/{poll_id}/vote", status_code=status.HTTP_200_OK)
async def vote_poll_endpoint(poll_id: str, vote: PollVote, db=Depends(get_db)):
    # The PollModel.vote_on_poll method has been updated to ensure that 
    # poll["ends_at"] is converted to a timezone-aware datetime before comparison.
    poll = await PollModel.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    updated_poll = await PollModel.vote_on_poll(poll_id, vote.user_id, vote.option_indices)
    if not updated_poll:
        raise HTTPException(status_code=400, detail="Failed to register vote")
    return updated_poll

@router.post("/polls/{poll_id}/close", status_code=status.HTTP_200_OK)
async def close_poll_endpoint(poll_id: str, db=Depends(get_db)):
    poll = await PollModel.get_poll_by_id(poll_id)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    closed_poll = await PollModel.close_poll(db, poll_id)
    if not closed_poll:
        raise HTTPException(status_code=400, detail="Failed to close poll")
    return closed_poll

# --------------------- Chatroom Endpoints ---------------------
class ChatroomCreate(BaseModel):
    name: str
    description: Optional[str] = ""

class ChatMessageCreate(BaseModel):
    user_id: str
    message: str

@router.post("/chatrooms", status_code=status.HTTP_201_CREATED)
async def create_chatroom_endpoint(chatroom: ChatroomCreate, db=Depends(get_db)):
    # Use ChatRoomModel.create_chat_room (note: it expects event_id, name, description, etc.)
    # If your chat room is not tied to a specific event, pass an empty string or modify accordingly.
    chatroom_obj = await ChatRoomModel.create_chat_room(db, event_id="", name=chatroom.name, description=chatroom.description, is_private=False, is_direct=False, participants=[])
    if not chatroom_obj:
        raise HTTPException(status_code=400, detail="Failed to create chatroom")
    return {"chatroom_id": str(chatroom_obj)}

@router.post("/chatrooms/{chatroom_id}/messages", status_code=status.HTTP_201_CREATED)
async def post_message_endpoint(chatroom_id: str, message: ChatMessageCreate, db=Depends(get_db)):
    # Verify chatroom exists
    chatroom = await ChatRoomModel.get_chat_room_by_id(chatroom_id)
    if not chatroom:
        raise HTTPException(status_code=404, detail="Chatroom not found")
    # Use ChatMessageModel.create_message: parameters (text, sender_id, chat_room_id)
    new_message_id = await ChatMessageModel.create_message(message.message, message.user_id, chatroom_id)
    if not new_message_id:
        raise HTTPException(status_code=400, detail="Failed to post message")
    return {"message_id": str(new_message_id)}

@router.get("/chatrooms/{chatroom_id}/messages", status_code=status.HTTP_200_OK)
async def get_messages_endpoint(chatroom_id: str, db=Depends(get_db)):
    chatroom = await ChatRoomModel.get_chat_room_by_id(chatroom_id)
    if not chatroom:
        raise HTTPException(status_code=404, detail="Chatroom not found")
    messages = await ChatMessageModel.get_chat_room_messages(chatroom_id)
    return {"messages": messages}

# --------------------- Q&A / Feedback Endpoints ---------------------
class QuestionCreate(BaseModel):
    question: str
    user_id: str
    session_id: str  # or event_id if applicable

@router.post("/questions", status_code=status.HTTP_201_CREATED)
async def create_question_endpoint(question: QuestionCreate, db=Depends(get_db)):
    new_question_id = await FeedbackModel.create_question(db, question.user_id, question.session_id, question.question)
    if not new_question_id:
        raise HTTPException(status_code=400, detail="Failed to create question")
    return {"question_id": str(new_question_id)}

@router.get("/questions/{session_id}", status_code=status.HTTP_200_OK)
async def list_questions_endpoint(session_id: str, db=Depends(get_db)):
    questions = await FeedbackModel.get_questions_for_session(db, session_id)
    return {"questions": questions}

@router.post("/questions/{question_id}/answer", status_code=status.HTTP_200_OK)
async def answer_question_endpoint(question_id: str, answer: dict, db=Depends(get_db)):
    updated_question = await FeedbackModel.answer_question(db, question_id, answer.get("answer_text"))
    if not updated_question:
        raise HTTPException(status_code=404, detail="Question not found or answer failed")
    return updated_question

# --------------------- Matchmaking and Itinerary Endpoints ---------------------
@router.get("/matchmaking", status_code=status.HTTP_200_OK)
async def matchmaking_endpoint(user_id: str, db=Depends(get_db)):
    """
    Dummy endpoint for matchmaking. 
    Replace this logic with your actual matchmaking algorithm.
    """
    matches = [
        {"user_id": "user1", "match_score": 0.85},
        {"user_id": "user2", "match_score": 0.80},
    ]
    return {"matches": matches}

@router.get("/itinerary", status_code=status.HTTP_200_OK)
async def personalized_itinerary_endpoint(user_id: str, event_id: str, db=Depends(get_db)):
    """
    Dummy endpoint for personalized itinerary.
    Replace this logic with your actual itinerary generation algorithm.
    """
    itinerary = {
        "event_id": event_id,
        "user_id": user_id,
        "sessions": [
            {"session_id": "session1", "time": "09:00 AM", "title": "Opening Keynote"},
            {"session_id": "session2", "time": "10:30 AM", "title": "Tech Talk"},
        ]
    }
    return {"itinerary": itinerary}
