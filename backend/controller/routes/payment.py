from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from controller.database import get_db
from controller.payment_model import (
    create_payment,
    calculate_event_revenue,
    create_sponsor,
    get_sponsors_by_event
    get_payments_by_user,
    get_payments_by_event,
)
import uuid

router = APIRouter()

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
    create_payment(data)
    return {"status": True, "msg": "Payment recorded", "payment_id": payment_id}

@router.get("/revenue/{event_id}")
def get_event_revenue(event_id: str):
    total = calculate_event_revenue(event_id)
    return {"event_id": event_id, "total_revenue": round(total, 2)}

@router.post("/add_sponsor")
def add_sponsor(sponsor: Sponsor):
    sponsor.id = str(uuid.uuid4())
    sponsor.contribution_date = datetime.now()
    create_sponsor(sponsor.dict())
    return {"status": True, "msg": "Sponsor recorded", "sponsor_id": sponsor.id}

@router.get("/sponsors/{event_id}")
def get_event_sponsors(event_id: str):
    return get_sponsors_by_event(event_id)

@router.get("/payments/user/{user_id}")
def fetch_payments_by_user(user_id: str):
    payments = get_payments_by_user(user_id)
    return {"user_id": user_id, "payments": payments}

@router.get("/payments/event/{event_id}")
def fetch_payments_by_event(event_id: str):
    payments = get_payments_by_event(event_id)
    return {"event_id": event_id, "payments": payments}