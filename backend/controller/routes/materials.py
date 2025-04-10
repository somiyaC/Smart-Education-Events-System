from fastapi import APIRouter, File, UploadFile, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
import gridfs
from pymongo import MongoClient
from bson.objectid import ObjectId
from controller.services.materials.database import add_material, get_materials_by_event, EventMaterial

router = APIRouter()
app = router

@app.post("/upload")
async def upload_file(material: EventMaterial):
    add_material(material.dict())
    return "ok"

@app.get("/{eventId}")
async def get_materials(eventId: str):

    materials = get_materials_by_event(eventId)
    return {"materials":materials}
