# main.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
from pymongo import DESCENDING
from fastapi.responses import JSONResponse
from controller.services.messages.models import MessageCreate, MessageResponse, ChatHistoryResponse
from controller.services.messages.database import insert_message, get_chat_history, get_message_by_id, messages_collection
from models.user_model import UserModel


router = APIRouter()
app = router

# use this to send messages
@app.post("/", response_model=MessageResponse)
async def send_message(message: MessageCreate):
    message_data = message.dict()
    inserted_id = insert_message(message_data)

    inserted_message = get_message_by_id(str(inserted_id))
    return MessageResponse(
        sender=inserted_message["sender"],
        recipient=inserted_message["recipient"],
        content=inserted_message["content"],
        timestamp=datetime.now()
    )

# use this to read messages
@app.get("/{sender}/{recipient}", response_model=ChatHistoryResponse)
async def get_messages(sender: str, recipient: str, limit: int = 20):
    messages = get_chat_history(sender, recipient, limit)
    
    message_list = [
        MessageResponse(
            sender=message["sender"],
            recipient=message["recipient"],
            content=message["content"],
            timestamp=message["timestamp"]
        ) for message in messages
    ]
    
    return ChatHistoryResponse(messages=message_list)

@app.get("/contacts")
async def get_contacts():
    users = await UserModel.find_users_by_role("speaker")
    contacts = []
    for user in users:
        contacts.append({"id":user['id'], "email":user['email']})

    return {"contacts":contacts}

@app.get("/{sender}")
async def get_recipients(sender: str):
    messages = messages_collection.find({"$or": [{"sender": sender}, {"recipient": sender}]})
    
    recipients = set()
    for message in messages:
        if message["sender"] != sender:
            recipients.add(message["sender"])
        if message["recipient"] != sender:
            recipients.add(message["recipient"])
    print(recipients)
    contacts = []
    
    for recipient in recipients:
        user = await UserModel.get_user_by_id(recipient)
        
        last_message = messages_collection.find(
            {"$or": [{"sender": sender, "recipient": recipient}, {"sender": recipient, "recipient": sender}]}
        ).sort("timestamp", DESCENDING).limit(1)

        last_message_content = None
        if last_message:
            last_message_content = last_message[0] 
        contacts.append({
            "id": recipient,
            "email": user['email'],
            "last_message": last_message_content["content"] if last_message_content else "No messages yet",
            "timestamp": last_message_content["timestamp"] if last_message_content else None
        })

    if not recipients:
        raise HTTPException(status_code=404, detail="No recipients found")

    return {"contacts": contacts}

@app.get("/{message_id}", response_model=MessageResponse)
async def get_single_message(message_id: str):
    message = get_message_by_id(message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    return MessageResponse(
        sender=message["sender"],
        recipient=message["recipient"],
        content=message["content"],
        timestamp=message["timestamp"]
    )
