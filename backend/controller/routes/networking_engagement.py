from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime, timezone
from controller.database import get_db
from models.poll_model import PollModel
from models.chat_model import ChatRoomModel, ChatMessageModel
from models.feedback_model import FeedbackModel
from models.user_model import UserModel
from bson import ObjectId

router = APIRouter(tags=["Networking & Engagement"])

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
    try:
        print(f"🔍 Logged in user ID: {user_id}")
        user = await UserModel.get_user_by_id(user_id)

        if not user or "interests" not in user:
            print("🚫 User not found or has no interests.")
            return {"matches": []}

        user_interests = set(user["interests"])
        print(f"🔗 Logged in user's interests: {user_interests}")

        # Fetch ALL users manually from DB
        collection = await UserModel.get_collection()
        cursor = collection.find({"interests": {"$exists": True, "$ne": []}})
        all_users = await cursor.to_list(length=None)

        matches = []
        for other in all_users:
            if str(other.get("_id")) == user_id:
                continue  # Skip self

            other_interests = set(other.get("interests", []))
            if user_interests.intersection(other_interests):
                print(f"✅ Match found with {other.get('email')}: {other_interests}")
                matches.append({
                    "user_id": str(other["_id"]),
                    "first_name": other.get("first_name", ""),
                    "last_name": other.get("last_name", ""),
                    "email": other.get("email", ""),
                    "company": other.get("company"),
                    "job_title": other.get("job_title"),
                    "interests": list(other_interests)
                })

        return {"matches": matches}

    except Exception as e:
        print(f"Matchmaking error: {str(e)}")
        return JSONResponse(status_code=500, content={"error": "Server Error"})


@router.get("/itinerary", status_code=status.HTTP_200_OK)
async def personalized_itinerary_endpoint(user_id: str, event_id: str, db=Depends(get_db)):
    itinerary = {
        "event_id": event_id,
        "user_id": user_id,
        "sessions": [
            {"session_id": "session1", "time": "09:00 AM", "title": "Opening Keynote"},
            {"session_id": "session2", "time": "10:30 AM", "title": "Tech Talk"},
        ]
    }
    return {"itinerary": itinerary}


from fastapi import Body

@router.post("/connect")
async def connect_users(
    data: dict = Body(...),
    db=Depends(get_db)
):
    user_id = data.get("user_id")
    target_user_id = data.get("target_user_id")

    if not user_id or not target_user_id:
        raise HTTPException(status_code=400, detail="Missing user_id or target_user_id")

    try:
        result = db["connections"].insert_one({
            "sender_id": user_id,
            "receiver_id": target_user_id,
            "status": "pending",
            "created_at": datetime.utcnow()
        })

        return {
            "status": True,
            "message": "Connection request sent",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        print("Error in connect_users:", e)
        raise HTTPException(status_code=500, detail=str(e))



from fastapi.responses import JSONResponse

@router.get("/connections/received")
def get_received_requests(user_id: str, db=Depends(get_db)):
    try:
        collection = db["connections"]
        cursor = collection.find({
            "receiver_id": user_id,
            "status": "pending"
        })
        connections = list(cursor)  # 🔄 No await here, just convert cursor to list

        results = []
        for conn in connections:
            sender = UserModel.get_user_by_id_sync(conn["sender_id"])  # sync method
            results.append({
                "_id": str(conn["_id"]),
                "sender_id": conn["sender_id"],
                "sender_email": sender.get("email", "Unknown") if sender else "Unknown",
                "status": conn["status"],
                "created_at": str(conn.get("created_at", "")),
            })

        return {"requests": results}

    except Exception as e:
        print("Error fetching connections:", e)
        return JSONResponse(status_code=500, content={"requests": []})




@router.post("/connections/respond", status_code=200)
async def respond_to_request(payload: dict, db=Depends(get_db)):
    request_id = payload.get("request_id")
    decision = payload.get("decision")  # "accepted" or "rejected"

    if decision not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid decision")

    connection = await db["connections"].find_one({"_id": ObjectId(request_id)})
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")

    # Update the status
    await db["connections"].update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": decision, "responded_at": datetime.utcnow()}}
    )

    if decision == "accepted":
        sender_id = connection["sender_id"]
        receiver_id = connection["receiver_id"]

        # Add each user to the other's "connections" list
        await db["users"].update_one(
            {"_id": ObjectId(sender_id)},
            {"$addToSet": {"connections": receiver_id}}
        )
        await db["users"].update_one(
            {"_id": ObjectId(receiver_id)},
            {"$addToSet": {"connections": sender_id}}
        )

    return {"status": "success", "message": f"Connection {decision}"}



@router.get("/user_connections")
def get_user_connections(user_id: str, db=Depends(get_db)):
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or "connections" not in user:
            return {"connections": []}

        connection_ids = user["connections"]

        connected_users_cursor = db["users"].find({
            "_id": {"$in": [ObjectId(uid) for uid in connection_ids]}
        })

        connected_users = list(connected_users_cursor)

        emails = list({
            user_doc.get("email")
            for user_doc in connected_users
            if str(user_doc["_id"]) != user_id
        })

        return {"connections": emails}

    except Exception as e:
        print("Error fetching user connections:", e)
        return JSONResponse(status_code=500, content={"connections": []})




@router.post("/connections/{request_id}/accept", status_code=200)
async def accept_connection(request_id: str, db=Depends(get_db)):
    connection = db["connections"].find_one({"_id": ObjectId(request_id)})
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")

    # Update the connection status
    db["connections"].update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "accepted", "responded_at": datetime.utcnow()}}
    )

    # Add each user to the other's connections list
    db["users"].update_one(
        {"_id": ObjectId(connection["receiver_id"])},
        {"$addToSet": {"connections": ObjectId(connection["sender_id"])}}
    )
    db["users"].update_one(
        {"_id": ObjectId(connection["sender_id"])},
        {"$addToSet": {"connections": ObjectId(connection["receiver_id"])}}
    )

    return {"status": "success", "message": "Connection accepted"}


@router.post("/connections/{request_id}/reject", status_code=200)
async def reject_connection(request_id: str, db=Depends(get_db)):
    connection = await db["connections"].find_one({"_id": ObjectId(request_id)})
    if not connection:
        raise HTTPException(status_code=404, detail="Connection request not found")

    await db["connections"].update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "responded_at": datetime.utcnow()}}
    )

    return {"status": "success", "message": "Connection rejected"}
