from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from controller.database import chat_collection

router = APIRouter()

class ChatMessage(BaseModel):
    text: str
    sender_id: str
    chat_room_id: str

@router.post("/")
def send_message(chat_message: ChatMessage):
    chat_dict = chat_message.dict()
    message_id = chat_collection.insert_one(chat_dict).inserted_id
    return {"message": "Message sent", "id": str(message_id)}

@router.get("/{chat_room_id}")
def get_messages(chat_room_id: str):
    messages = list(chat_collection.find({"chat_room_id": chat_room_id}))
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    return messages