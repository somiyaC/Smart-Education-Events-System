from pymongo import MongoClient
from pymongo.collection import Collection
from datetime import datetime
from bson import ObjectId
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI")) 
db = client["SEES"]  
fs: Collection = db["files"]

def add_file(content: bytes, filename: str, content_type: str) -> str:
    file_id = fs.put(content, filename=filename, content_type=content_type)
    return str(file_id)

def get_file_metadata(file_id: str) -> Optional[dict]:
    try:
        file = fs.get(ObjectId(file_id))
        return {
            "filename": file.filename,
            "content_type": file.content_type,
            "upload_date": file.upload_date,
            "length": file.length
        }
    except:
        return None

def get_file_content(file_id: str) -> Optional[bytes]:
    try:
        file = fs.get(ObjectId(file_id))
        return file.read()
    except:
        return None

def delete_file(file_id: str) -> bool:
    try:
        fs.delete(ObjectId(file_id))
        return True
    except:
        return False
