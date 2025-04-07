from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from controller.database import db_instance as db
router = APIRouter()

payments_collection = db["payments"]
sponsors_collection = db["sponsors"]


class PaymentRequest(BaseModel):
    amount: float
    currency: str
    status: str
    user_id: str
    event_id: str
    payment_method: str
    payment_provider: str
    billing_name: str
    billing_email: str
    billing_address: dict
    last_four: str
    discount_code: Optional[str] = None

class Sponsor(BaseModel):
    id: str
    event_id: str
    name: str
    amount: float
    contribution_date: datetime

@router.post("/payments/process")
def process_payment(payment: PaymentRequest):
    payment_id = str(uuid.uuid4())
    data = payment.dict()
    data["id"] = payment_id
    data["timestamp"] = datetime.now()
    payments_collection.insert_one(data)
    return {"status": True, "msg": "Payment recorded", "payment_id": payment_id}

@router.get("/revenue/{event_id}")
def get_event_revenue(event_id: str):
    payments = payments_collection.find({"event_id": event_id})
    total = sum(p["amount"] for p in payments)
    return {"event_id": event_id, "total_revenue": round(total, 2)}

@router.post("/add_sponsor")
def add_sponsor(sponsor: Sponsor):
    sponsor.id = str(uuid.uuid4())
    sponsor.contribution_date = datetime.now()
    sponsors_collection.insert_one(sponsor.dict())
    return {"status": True, "msg": "Sponsor recorded", "sponsor_id": sponsor.id}

@router.get("/sponsors/{event_id}")
def get_event_sponsors(event_id: str):
    sponsors = list(sponsors_collection.find({"event_id": event_id}))
    return sponsors
