from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
from pydantic import BaseModel
from bson import ObjectId
from typing import Optional, List, Literal
from dotenv import load_dotenv
import os

load_dotenv()

class EventMaterial(BaseModel):
    event_id: str
    type: Literal["text", "file"]
    file_name: Optional[str] = None
    content: Optional[str] = None

client = MongoClient(os.getenv("MONGO_URI")) 
db = client["SEES"]  
materials_collection: Collection = db["materials"]

def add_material(data: dict):
    """
    Adds a new material to the event materials collection.
    
    Args:
        data (dict): Dictionary with keys: event_id, type, title, content (if type=text), file_url (if type=file)
    
    Returns:
        dict: Inserted document (including its _id).
    """
    if data["type"] not in ["text", "file"]:
        raise ValueError("Material type must be 'text' or 'file'")

    if data["type"] == "text" and not data.get("content"):
        raise ValueError("Text materials must include 'content'")
    
    if data["type"] == "file" and not data.get("file_name"):
        raise ValueError("File materials must include 'file_name'")

    material_data = {
        "event_id": data["event_id"],
        "type": data["type"],
        "content": data.get("content"),
        "file_name": data.get("file_name")
    }

    material = EventMaterial(**material_data)
    result = materials_collection.insert_one(material.dict(by_alias=True))
    inserted_doc = materials_collection.find_one({"_id": result.inserted_id})
    return inserted_doc

def get_materials_by_event(event_id: str) -> List[EventMaterial]:
    """
    Retrieves all materials for a specific event by event_id.

    Args:
        event_id (str): ID of the event.

    Returns:
        List[EventMaterial]: List of materials for the event.
    """
    cursor = materials_collection.find({"event_id": event_id})
    materials = []

    for doc in cursor:
        # Convert ObjectId to string for compatibility with Pydantic
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        materials.append(EventMaterial(**doc))

    return materials
