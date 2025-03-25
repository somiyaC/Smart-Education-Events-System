from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.models.mediators.chat_mediator import ChatMediator

router = APIRouter()

class ChatMessage(BaseModel):
    text: str
    sender_id: str
    chat_room_id: str

@router.post("/")
async def send_message(chat_message: ChatMessage):
    try:
        message_id = await ChatMediator.send_message(
            chat_message.text, 
            chat_message.sender_id, 
            chat_message.chat_room_id
        )
        return {"message": "Message sent", "id": message_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{chat_room_id}")
async def get_messages(chat_room_id: str, limit: int = 50, skip: int = 0):
    try:
        messages = await ChatMediator.get_messages(chat_room_id, limit, skip)
        return messages
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))