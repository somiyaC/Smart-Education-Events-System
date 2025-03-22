from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import venues_collection

router = APIRouter()

class Venue(BaseModel):
    name: str
    address: str
    capacity: int

@router.post("/")
def create_venue(venue: Venue):
    venue_dict = venue.dict()
    venue_id = venues_collection.insert_one(venue_dict).inserted_id
    return {"message": "Venue created", "id": str(venue_id)}

@router.get("/{venue_id}")
def get_venue(venue_id: str):
    venue = venues_collection.find_one({"_id": venue_id})
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue
