from fastapi import APIRouter, File, UploadFile, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import gridfs
from pymongo import MongoClient
from bson.objectid import ObjectId

router = APIRouter()
app = router

# Sync client for GridFS (GridFS doesn't support async directly)
sync_client = MongoClient("mongodb://localhost:27017")
sync_db = sync_client["your_database"]
fs = gridfs.GridFS(sync_db)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        # Store the file using GridFS
        file_id = fs.put(contents, filename=file.filename, content_type=file.content_type)

        return {"message": "File uploaded successfully", "file_id": str(file_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
