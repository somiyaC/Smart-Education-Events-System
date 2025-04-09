from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI")) 
db = client["SEES"]  
messages_collection: Collection = db["messages"] 

def insert_message(message_data):
    message_data["timestamp"] = datetime.utcnow() 
    result = messages_collection.insert_one(message_data)
    return result.inserted_id

def get_chat_history(sender: str, recipient: str, limit: int = 20):
    query = {
        "$or": [
            {"sender": sender, "recipient": recipient},
            {"sender": recipient, "recipient": sender}
        ]
    }
    messages = messages_collection.find(query).sort("timestamp", 1).limit(limit)
    return messages

def get_message_by_id(message_id: str):
    return messages_collection.find_one({"_id": ObjectId(message_id)})
